interface LoaderProps {
  loading: boolean;
  composingText: string;
  signatureText: string;
}

export function Loader({ loading, composingText, signatureText }: LoaderProps) {
  return (
    <div className={`loader${loading ? '' : ' hidden'}`} id="loader">
      <div className="pulse" />
      <div className="label">{composingText}</div>
      <div className="sub">{signatureText}</div>
    </div>
  );
}
