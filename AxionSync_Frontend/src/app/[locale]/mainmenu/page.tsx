"use client";

import { useEffect } from "react";
import { useUserStore } from "@/Store/user";
import { useTranslations } from "next-intl";

export default function MainmenuPage() {
  const { users, loading, getUsers } = useUserStore();
  const t = useTranslations("mainmenu.headers");
  const tPage = useTranslations("mainmenu");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  return (
    <div>
      {loading && (
        <div className="global-loading">
          <div className="global-spinner" />
        </div>
      )}
      <h1>{tPage("title")}</h1>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              {t("id")}
            </th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              {t("username")}
            </th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              {t("firstname")}
            </th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              {t("lastname")}
            </th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              {t("nickname")}
            </th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              {t("role")}
            </th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              {t("tel")}
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {u.id}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {u.username}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {u.firstname}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {u.lastname}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {u.nickname}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {u.role}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                {u.tel}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
