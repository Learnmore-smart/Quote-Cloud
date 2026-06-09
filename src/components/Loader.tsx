interface LoaderProps {
  loading: boolean;
}

export function Loader({ loading }: LoaderProps) {
  return (
    <div className={`loader${loading ? '' : ' hidden'}`} id="loader">
      <div className="pulse" />
      <div className="label">Composing</div>
      <div className="sub">Quote Cloud · AI Layout</div>
    </div>
  );
}
