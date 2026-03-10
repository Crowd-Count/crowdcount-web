export default function Loading() {
  return (
    <div className="loading-screen">
      <div className="loading-logo-pulse">
        <span className="gradient-text">CrowdCount</span>
      </div>
      <div className="loading-bar-track">
        <div className="loading-bar" />
      </div>
    </div>
  );
}
