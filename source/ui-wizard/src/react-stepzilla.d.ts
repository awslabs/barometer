// react-stepzilla.d.ts
declare module "react-stepzilla" {
    export interface IStep {
        name: string;
        component: JSX.Element;
    }

    export interface IStepZillaProps {
        steps: IStep[];
        showSteps?: boolean;
        showNavigation?: boolean;
        stepsNavigation?: boolean;
        prevBtnOnLastStep?: boolean;
        dontValidate?: boolean;
        preventEnterSubmission?: boolean;
        startAtStep?: number;
        nextButtonText?: string;
        nextTextOnFinalActionStep?: string;
        nextButtonCls?: string;
        backButtonCls?: string;
        backButtonText?: string;
        hocValidationAppliedTo?: number[],
        onStepChange?: (step: number) => void;
    }

    export default class StepZilla extends React.Component<IStepZillaProps, {}> {}
}
