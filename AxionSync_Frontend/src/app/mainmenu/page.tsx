"use client";

import { useEffect } from "react";
import { useUserStore } from "@/Store/user";
import LogoutBtn from "@/Components/LogoutBtn";

export default function MainmenuPage() {
  const { users, getUsers } = useUserStore();

  useEffect(() => {
    getUsers(); // โหลด users ตอน mount
  }, []);

  return (
    <div>
      <h1>Main Menu - Users</h1>
      <LogoutBtn></LogoutBtn>

      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>ID</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              Username
            </th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              Firstname
            </th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              Lastname
            </th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              Nickname
            </th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Role</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Tel</th>
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
