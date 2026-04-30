"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        phone: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await fetch("http://process.env.NEXT_PUBLIC_API_URL/user/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Registrasi gagal, periksa kembali data Anda.");
            }

            router.push("/login");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-yellow-400 flex items-center justify-center p-4 font-sans">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 md:p-10">
                <div className="mb-8">
                    <p className="text-gray-500 text-sm mb-1">Hello, Welcome</p>
                    <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all placeholder-gray-400 text-gray-900"
                        />
                    </div>

                    <div>
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all placeholder-gray-400 text-gray-900"
                        />
                    </div>

                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email address"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all placeholder-gray-400 text-gray-900"
                        />
                    </div>

                    <div>
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone number (Opsional)"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all placeholder-gray-400 text-gray-900"
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all placeholder-gray-400 text-gray-900"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 rounded-lg transition-colors flex justify-center items-center mt-6"
                    >
                        {isLoading ? "Signing up..." : "Sign up"}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="text-yellow-600 hover:text-yellow-700 font-semibold">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}