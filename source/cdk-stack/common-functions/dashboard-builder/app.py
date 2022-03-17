import copy
import json
import os

import boto3
import botocore

cloudwatch = boto3.client("cloudwatch")
template_cache = {}


def rearrange_widgets(dashboard):
    x = 0
    y = 0
    row_size = 0
    col_size = 0
    row_max = 24
    for widget in dashboard["widgets"]:
        widget["y"] = y
        widget["x"] = x
        row_size += widget["width"]
        if row_size < row_max:
            x = row_max - row_size
        else:
            row_size = 0
            x = 0
            col_size += widget["height"]
            y = col_size
    return dashboard


def lambda_handler(event, context):
    print(json.dumps(event))

    stack_name = event["stackName"]
    user_sessions = event["userSessions"]
    experiment_name = event["experimentName"].replace("/", "_")
    queries = event["queries"]
    ddl_queries = event["ddlQueries"]

    summary_dashboard = populate_benchmarking_widgets(queries, get_cloudwatch_summary_dashboard(), user_sessions,
                                                      stack_name)
    # Write back summary dashboard updates
    cloudwatch.put_dashboard(DashboardName=os.environ["SummaryDashboardName"],
                             DashboardBody=json.dumps(rearrange_widgets(summary_dashboard)))
    experiment_dashboard = create_experiment_dashboard(user_sessions, queries, ddl_queries, stack_name)
    # Create new experiment dashboard
    cloudwatch.put_dashboard(DashboardName=os.environ["ExperimentDashboardPrefix"] + experiment_name,
                             DashboardBody=json.dumps(rearrange_widgets(experiment_dashboard)))


def create_experiment_dashboard(user_sessions, queries, ddl_queries, stack_name):
    dashboard = get_template("experiment-dashboard")
    for widget in dashboard["widgets"]:
        widget["properties"]["region"] = os.environ["AWS_REGION"]
        if widget["properties"]["title"] == "Data copy time sum":
            widget["properties"]["metrics"][0][5] = user_sessions[0]["secretId"]
            widget["properties"]["metrics"][0][-1] = stack_name
        if widget["properties"]["title"] == "DDL script execution time sum":
            for ddl_query in ddl_queries:
                widget["properties"]["metrics"].append(["Benchmarking",
                                                        "runTimeMillis",
                                                        "SCRIPT_PATH",
                                                        ddl_query,
                                                        "SECRET_ID",
                                                        user_sessions[0]["secretId"],
                                                        "SESSION_ID",
                                                        "DDL",
                                                        "STACK_NAME",
                                                        stack_name])
    return populate_benchmarking_widgets(queries, dashboard, user_sessions, stack_name)


def populate_benchmarking_widgets(queries, dashboard, user_sessions, stack_name):
    users = []
    for session in user_sessions:
        user = session["secretId"]
        if user not in users:
            users.append(user)
    print("Processing users - " + json.dumps(users))
    for user in users:
        widget = build_summery_widget(queries, stack_name, user, user_sessions)
        print("Adding widget to dashboard: " + json.dumps(widget))
        dashboard["widgets"].append(widget)
    return dashboard


def build_summery_widget(queries, stack_name, user, user_sessions):
    widget = get_template("summary-widget")
    for session in filter(lambda s: user == s["secretId"], user_sessions):
        for sessionId in session["sessionIds"]:
            for query in queries:
                widget["properties"]["metrics"].append([
                    "Benchmarking",
                    "runTimeMillis",
                    "SCRIPT_PATH",
                    query,
                    "SECRET_ID",
                    session["secretId"],
                    "SESSION_ID",
                    str(sessionId),
                    "STACK_NAME",
                    stack_name
                ])
    widget["properties"]["region"] = os.environ["AWS_REGION"]
    widget["properties"]["title"] = "Benchmarking query timings user - " + user.split(":")[-1].split("-")[0]
    return widget


def get_cloudwatch_summary_dashboard():
    try:
        # Read summary dashboard from cloudwatch if exists
        response = cloudwatch.get_dashboard(DashboardName=os.environ["SummaryDashboardName"])
        summary_dashboard = json.loads(response["DashboardBody"])
    except botocore.exceptions.ClientError as error:
        if error.response['Error']['Code'] == 'ResourceNotFound':
            # Prepare summary dashboard from template if doesn't exist
            print("Dashboard " + os.environ["SummaryDashboardName"] + " not found creating fresh.")
            summary_dashboard = {"widgets": []}
        else:
            raise error
    return summary_dashboard


def get_template(name):
    if name not in template_cache:
        fp = open('templates/' + name + '.json')
        summary_widget_template = json.load(fp)
        fp.close()
        template_cache[name] = summary_widget_template
    return copy.deepcopy(template_cache[name])
