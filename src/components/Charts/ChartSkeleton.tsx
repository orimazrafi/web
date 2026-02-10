import Skeleton from "react-loading-skeleton";

export function ChartSkeleton() {
  return (
    <div
      style={{
        width: "100%",
        height: 320,
        padding: "16px 24px",
        boxSizing: "border-box",
      }}
    >
      {/* Title */}
      <Skeleton width={120} height={16} />

      <div
        style={{
          position: "relative",
          height: "calc(100% - 24px)",
          marginTop: 12,
        }}
      >
        {/* Y axis */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 24,
            width: 32,
          }}
        >
          <Skeleton height="100%" />
        </div>

        {/* Chart bars */}
        <div
          style={{
            position: "absolute",
            left: 48,
            right: 0,
            bottom: 24,
            top: 0,
            display: "flex",
            alignItems: "flex-end",
            gap: 12,
          }}
        >
          {[40, 60, 80, 55, 70].map((h, i) => (
            <Skeleton
              key={i}
              height={`${h}%`}
              width={28}
              style={{ borderRadius: 4 }}
            />
          ))}
        </div>

        {/* X axis */}
        <div
          style={{
            position: "absolute",
            left: 48,
            right: 0,
            bottom: 0,
          }}
        >
          <Skeleton height={12} />
        </div>
      </div>
    </div>
  );
}
