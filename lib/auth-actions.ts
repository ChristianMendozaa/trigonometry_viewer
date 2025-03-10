"use client"

import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth"
import { auth } from "../config/firebaseConfig"

const API_URL = process.env.NEXT_PUBLIC_API_URL // Carga la URL del backend desde el .env

type LoginCredentials = {
  email: string
  password: string
}

type RegisterData = {
  name: string
  email: string
  password: string
}

type AuthResult = {
  success: boolean
  user?: {
    id: string
    name: string
    email: string
    role: "user" | "admin"
  }
  error?: string
}
export async function login(credentials: LoginCredentials): Promise<AuthResult> {
  try {
    // 🔹 Autenticación con Firebase
    const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
    const token = await userCredential.user.getIdToken();

    console.log("🔹 Token obtenido:", token);

    // 🔹 Obtener datos del usuario desde el backend
    const res = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Error al obtener datos del usuario");

    const userData = await res.json();

    // 🔹 Agregar el token al objeto del usuario antes de guardarlo
    const userWithToken = { ...userData, token };

    // 🔹 Guardar en localStorage
    localStorage.setItem("user", JSON.stringify(userWithToken));

    return { success: true, user: userWithToken };
  } catch (error) {
    console.error("❌ Error en el login:", error);
    return { success: false, error: "Credenciales inválidas" };
  }
}

export async function register(data: RegisterData): Promise<AuthResult> {
  try {
    console.log("🔹 Enviando datos de registro al backend:", data);

    // Enviar los datos al backend sin crear el usuario en el frontend
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("❌ Error en la respuesta del backend:", errorData);
      throw new Error(errorData.detail || "Error en el registro");
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Error en el registro:", error);
    return { success: false, error: "Error al registrar usuario" };
  }
}

export async function logout(): Promise<void> {
  await signOut(auth)
  localStorage.removeItem("user")
}
