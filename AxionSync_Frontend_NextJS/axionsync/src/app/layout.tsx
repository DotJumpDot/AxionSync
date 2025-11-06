import Header from "@/Components/Header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AxionSync",
  description: "AxionSync Application",
  keywords: ["AxionSync", "Next.js", "Application", "Thailand"],
};

function layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Header></Header>
        {children}
      </body>
    </html>
  );
}
export default layout;
