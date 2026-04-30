"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [totalSpent, setTotalSpent] = useState(0);

    // state untuk form update
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        phone: "",
    });

    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
            router.push("/login");
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setFormData({
            name: parsedUser.name || "",
            username: parsedUser.username || "",
            phone: parsedUser.phone || "",
        });

        // mengambil total pengeluaran dan histori transaksi
        const fetchDashboardData = async () => {
            try {
                const [historyRes, spentRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/history?user_id=${parsedUser.id}`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/total-spent?user_id=${parsedUser.id}`)
                ]);

                const historyData = await historyRes.json();
                const spentData = await spentRes.json();

                if (historyData.success) setHistory(historyData.payload);
                if (spentData.success) setTotalSpent(spentData.payload.total_spent);
            } catch (err) {
                console.error("Gagal mengambil data dasbor:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: user.id,
                    name: formData.name,
                    username: formData.username,
                    phone: formData.phone,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Gagal memperbarui profil");
            }

            // update data di state dan localStorage
            const updatedUser = { ...user, name: formData.name, username: formData.username, phone: formData.phone };
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));

            setMessage({ type: "success", text: "Profil berhasil diperbarui!" });
            setIsEditing(false);
        } catch (err: any) {
            setMessage({ type: "error", text: err.message });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
    };

    if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>Memuat profil...</p></div>;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <nav className="bg-yellow-400 p-4 shadow-md">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">SBD Store</h1>
                    <div className="flex gap-4 items-center">
                        <Link href="/items" className="text-gray-800 font-semibold hover:text-gray-600">
                            Belanja
                        </Link>
                        <button onClick={handleLogout} className="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto p-6 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* kolom kiri detail pprofil & form update */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Profil Saya</h2>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="text-yellow-600 text-sm font-semibold hover:underline"
                            >
                                {isEditing ? "Batal" : "Edit Profil"}
                            </button>
                        </div>

                        {message.text && (
                            <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {message.text}
                            </div>
                        )}

                        {!isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Nama Lengkap</p>
                                    <p className="font-semibold text-gray-900">{user?.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Username</p>
                                    <p className="font-semibold text-gray-900">@{user?.username}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-semibold text-gray-900">{user?.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">No. Telepon</p>
                                    <p className="font-semibold text-gray-900">{user?.phone || "-"}</p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-500">Nama Lengkap</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-yellow-400 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Username</label>
                                    <input type="text" name="username" value={formData.username} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-yellow-400 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">No. Telepon</label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-yellow-400 focus:outline-none" />
                                </div>
                                <button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-2 rounded-lg transition-colors">
                                    Simpan Perubahan
                                </button>
                            </form>
                        )}
                    </div>

                    {/* card info saldo & pengeluaran */}
                    <div className="bg-yellow-400 rounded-xl shadow-md p-6 text-gray-900">
                        <h3 className="text-lg font-bold mb-4">Informasi Keuangan</h3>
                        <div className="mb-4">
                            <p className="text-sm font-medium opacity-80">Saldo Saat Ini</p>
                            <p className="text-2xl font-bold bg-white px-3 py-2 rounded-lg mt-1 inline-block">{formatRupiah(user?.balance || 0)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium opacity-80">Total Pengeluaran Belanja</p>
                            <p className="text-xl font-bold mt-1">{formatRupiah(totalSpent || 0)}</p>
                        </div>
                    </div>
                </div>

                {/* kolom kanan histori transaksi */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-900">Histori Belanja</h2>
                            <Link href="/transactions" className="text-sm text-yellow-600 hover:underline font-semibold">
                                Lihat Detail Transaksi &rarr;
                            </Link>
                        </div>

                        {history.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">Belum ada riwayat transaksi.</div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {history.map((trx) => (
                                    <li key={trx.id} className="p-6 hover:bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{trx.item_name} <span className="text-sm font-normal text-gray-500">x{trx.quantity}</span></h3>
                                            <p className="text-sm text-gray-500">{new Date(trx.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>

                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">{formatRupiah(trx.total)}</p>
                                            <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${trx.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {trx.status}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>)}
                    </div>
                </div>
            </main>
        </div>
    );
}