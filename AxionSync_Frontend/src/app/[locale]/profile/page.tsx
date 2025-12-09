"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/Store/auth";
import { useUserStore } from "@/Store/user";
import { Button, Input, Card, Avatar, Spin, App } from "antd";
import {
  UserOutlined,
  CameraOutlined,
  SaveOutlined,
  EditOutlined,
} from "@ant-design/icons";

export default function ProfilePage() {
  const { user: authUser } = useAuthStore();
  const { editedUser, loading, getUser, updateProfile, uploadPicture } =
    useUserStore();
  const t = useTranslations("common");
  const { message } = App.useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    nickname: "",
    tel: "",
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user data on mount
  useEffect(() => {
    if (authUser?.id) {
      getUser(authUser.id);
    }
  }, [authUser?.id, getUser]);

  // Reset form when starting to edit or when user data changes
  const resetForm = () => {
    if (editedUser) {
      setFormData({
        firstname: editedUser.firstname || "",
        lastname: editedUser.lastname || "",
        nickname: editedUser.nickname || "",
        tel: editedUser.tel || "",
      });
    }
  };

  const handleEditClick = () => {
    resetForm();
    setIsEditing(true);
  };

  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!authUser?.id) return;

    const fields: Array<{ key: keyof typeof formData; label: string }> = [
      { key: "firstname", label: t("firstName") },
      { key: "lastname", label: t("lastName") },
      { key: "nickname", label: t("nickname") },
      { key: "tel", label: t("phoneNumber") },
    ];

    for (const { key, label } of fields) {
      const raw = formData[key]?.trim() ?? "";
      if (!raw) {
        message.error(`${label} is required and cannot be empty.`);
        return;
      }
      if (/\s/.test(raw)) {
        message.error(`${label} cannot contain spaces.`);
        return;
      }
    }

    const result = await updateProfile(authUser.id, {
      firstname: formData.firstname.trim(),
      lastname: formData.lastname.trim(),
      nickname: formData.nickname.trim(),
      tel: formData.tel.trim(),
    });

    if (result.success) {
      message.success(t("profileUpdated"));
      setIsEditing(false);
      getUser(authUser.id);
    } else {
      message.error(result.message || t("failedUpdateProfile"));
    }
  };

  const handlePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !authUser?.id) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      message.error(t("fileTooLarge"));
      return;
    }

    setUploading(true);
    const result = await uploadPicture(authUser.id, file);
    setUploading(false);

    if (result.success) {
      message.success(t("profilePictureUpdated"));
      getUser(authUser.id);
    } else {
      message.error(result.message || t("failedUploadPicture"));
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getProfilePictureUrl = () => {
    if (editedUser?.picture_url) {
      return `/userProfilePicture/${editedUser.picture_url}`;
    }
    return `/userProfilePicture/unidentified.jpg`;
  };

  // Display values: use form data when editing, otherwise use editedUser
  const displayValues = isEditing
    ? formData
    : {
        firstname: editedUser?.firstname || "",
        lastname: editedUser?.lastname || "",
        nickname: editedUser?.nickname || "",
        tel: editedUser?.tel || "",
      };

  if (!authUser) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#36393f",
        }}
      >
        <Card style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "#666" }}>{t("pleaseLogin")}</p>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#36393f",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <Card
          style={{
            backgroundColor: "#2f3136",
            border: "1px solid #202225",
            borderRadius: "8px",
          }}
          styles={{
            body: { padding: "32px" },
          }}
        >
          <h1
            style={{
              color: "#ffffff",
              fontSize: "24px",
              fontWeight: 600,
              marginBottom: "32px",
              textAlign: "center",
            }}
          >
            {t("profile")}
          </h1>

          {/* Profile Picture Section */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                position: "relative",
                cursor: "pointer",
              }}
              onClick={handlePictureClick}
            >
              {uploading ? (
                <div
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    backgroundColor: "#40444b",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Spin />
                </div>
              ) : (
                <Avatar
                  size={120}
                  src={getProfilePictureUrl()}
                  icon={<UserOutlined />}
                  style={{
                    border: "4px solid #5865f2",
                  }}
                />
              )}
              <div
                style={{
                  position: "absolute",
                  bottom: "0",
                  right: "0",
                  backgroundColor: "#5865f2",
                  borderRadius: "50%",
                  padding: "8px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CameraOutlined style={{ color: "#fff", fontSize: "16px" }} />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <p
              style={{
                color: "#72767d",
                fontSize: "12px",
                marginTop: "8px",
              }}
            >
              {t("changeProfilePicture")}
            </p>
          </div>

          {/* User Info Section */}
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                color: "#b9bbbe",
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                marginBottom: "8px",
                display: "block",
              }}
            >
              {t("username")}
            </label>
            <Input
              value={authUser.username}
              disabled
              style={{
                backgroundColor: "#202225",
                border: "1px solid #40444b",
                color: "#72767d",
                padding: "10px 12px",
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                color: "#b9bbbe",
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                marginBottom: "8px",
                display: "block",
              }}
            >
              {t("firstName")}
            </label>
            <Input
              value={displayValues.firstname}
              onChange={(e) =>
                setFormData({ ...formData, firstname: e.target.value })
              }
              disabled={!isEditing}
              placeholder="Enter your first name"
              style={{
                backgroundColor: isEditing ? "#40444b" : "#202225",
                border: "1px solid #40444b",
                color: isEditing ? "#dcddde" : "#72767d",
                padding: "10px 12px",
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                color: "#b9bbbe",
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                marginBottom: "8px",
                display: "block",
              }}
            >
              {t("lastName")}
            </label>
            <Input
              value={displayValues.lastname}
              onChange={(e) =>
                setFormData({ ...formData, lastname: e.target.value })
              }
              disabled={!isEditing}
              placeholder="Enter your last name"
              style={{
                backgroundColor: isEditing ? "#40444b" : "#202225",
                border: "1px solid #40444b",
                color: isEditing ? "#dcddde" : "#72767d",
                padding: "10px 12px",
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                color: "#b9bbbe",
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                marginBottom: "8px",
                display: "block",
              }}
            >
              {t("nickname")}
            </label>
            <Input
              value={displayValues.nickname}
              onChange={(e) =>
                setFormData({ ...formData, nickname: e.target.value })
              }
              disabled={!isEditing}
              placeholder="Enter your nickname"
              style={{
                backgroundColor: isEditing ? "#40444b" : "#202225",
                border: "1px solid #40444b",
                color: isEditing ? "#dcddde" : "#72767d",
                padding: "10px 12px",
              }}
            />
          </div>

          <div style={{ marginBottom: "32px" }}>
            <label
              style={{
                color: "#b9bbbe",
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                marginBottom: "8px",
                display: "block",
              }}
            >
              {t("phoneNumber")}
            </label>
            <Input
              value={displayValues.tel}
              onChange={(e) =>
                setFormData({ ...formData, tel: e.target.value })
              }
              disabled={!isEditing}
              placeholder="Enter your phone number"
              style={{
                backgroundColor: isEditing ? "#40444b" : "#202225",
                border: "1px solid #40444b",
                color: isEditing ? "#dcddde" : "#72767d",
                padding: "10px 12px",
              }}
            />
          </div>

          {/* Action Buttons */}
          <div
            style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}
          >
            {isEditing ? (
              <>
                <Button
                  onClick={handleCancel}
                  style={{
                    backgroundColor: "#40444b",
                    border: "none",
                    color: "#dcddde",
                  }}
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  loading={loading}
                  style={{
                    backgroundColor: "#5865f2",
                    border: "none",
                  }}
                >
                  {t("saveChanges")}
                </Button>
              </>
            ) : (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEditClick}
                style={{
                  backgroundColor: "#5865f2",
                  border: "none",
                }}
              >
                {t("editProfile")}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
