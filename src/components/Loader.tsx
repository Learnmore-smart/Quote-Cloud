interface LoaderProps {
  loading: boolean;
  composingText: string;
  signatureText: string;
}

export function Loader({ loading, composingText, signatureText }: LoaderProps) {
  return (
    <div className={`loader-container${loading ? '' : ' hidden'}`} id="loader">
      <div className="loader-backdrop" />
      <div className="loader-content">
        <div className="loader-spinner">
          <div className="spinner-ring" />
          <div className="spinner-core">QC</div>
        </div>
        <div className="label">{composingText}</div>
        <div className="sub">{signatureText}</div>
      </div>
    </div>
  );
}
