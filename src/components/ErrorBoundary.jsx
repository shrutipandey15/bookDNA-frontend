import { Component } from "react";
import "./ErrorBoundary.css";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error(`[ErrorBoundary:${this.props.name || "unknown"}]`, error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="eb-fallback">
          <div className="eb-glyph">⚠</div>
          <div className="eb-title">Something broke</div>
          <div className="eb-detail">
            {this.props.name && <span>The <strong>{this.props.name}</strong> tab hit an error. </span>}
            Your other tabs still work.
          </div>
          <button className="eb-retry" onClick={this.handleRetry}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}