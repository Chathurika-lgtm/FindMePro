export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#ffffff",
        borderTop: "1px solid #e5e7eb",
        padding: "18px 32px",
        textAlign: "center",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "#6b7280",
          fontSize: "14px",
        }}
      >
        © {new Date().getFullYear()} FindMePro. All rights reserved.
      </p>
    </footer>
  );
}