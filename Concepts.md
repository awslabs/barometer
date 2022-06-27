# Barometer Project

## Architectural Concepts

1. **Extensible**: The project & it's modules should be extensible so that it can support future use cases for example
   add new platform or "Bring your own dataset" (BYOD)
2. **Maintainable**: Being a community project it is important to keep the project maintainable for very long term.
3. **Secure**: Security is job zero always here it is even more important as Barometer tool works with data & customer
   account
4. **Welcoming**: Being a community project to help others contribute we need to keep the learning curve to minimal,
   automate processes & follow conventions & best practices for easy/fast on-boarding.
5. **Scalable**: The architecture will typically work with big datasets hence all architectural component must be
   scalable to absorb it.

## Architecture Design Principals

### Extensible

- Pluggable modular design using contracts (interfaces) only to communicate between modules & classes
- [Convention over configuration](https://en.wikipedia.org/wiki/Convention_over_configuration)

### Maintainable

- Document everything

### Secure

- Deny all, allow specific source/port network rules
- Encryption at rest & in-transit
- Least IAM privileges using roles & policies (Resource policies for dual enforcement)
- Static security code analyzers (cfn-lint, git leak etc.)

### Welcoming

- Automation using CI ensuring
    - Code compiles
    - Static code analysis for established best practices
    - Security tools run
- Manual peer review using pull request based merging only
- Polyglot code base
- Pull request, feature request & bug report templates

### Scalable

- Using serverless infrastructure
- Infrastructure as code
- Dynamic resource allocation (ex: Parameters defined dynamically based on volume of data)

## Barometer project is composed of

- [CDK Stack](./source/cdk-stack)
- [Command line Wizard](./source/cli-wizard)
