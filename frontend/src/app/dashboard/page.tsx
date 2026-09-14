import MainLayout from "@/components/layout/MainLayout";

export default function DashboardPage() {
  return (
    <MainLayout>
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: "28px",
            color: "#123b72",
          }}
        >
          Welcome to FindMePro
        </h1>

        <p
          style={{
            marginTop: "10px",
            color: "#6b7280",
          }}
        >
          Your dashboard is ready.
        </p>
      </div>
    </MainLayout>
  );
}