/// <reference types="vite/client" />
declare namespace JSX {
    interface Spline extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
        url: string
        width: any
        height: any
    }
    interface IntrinsicElements {
      'spline-viewer': Spline;
    }
  }