"use client";

import withAuth from "@/services/withAuth";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// export default withAuth(ProtectedLayout);
export default ProtectedLayout; // 라이브 데모를 위해 해제
