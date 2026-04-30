"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Item {
    id: number;
    name: string;
    price: number;
    stock: number;
}

export default function ItemsPage() {
    const router = useRouter();
    const [items, setItems] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
            router.push("/login");
            return;
        }

        setUser(JSON.parse(userData));

        const fetchItems = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/items`);
                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.message || "Gagal mengambil data barang");
                }

                setItems(data.payload);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchItems();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    // fungsi untuk membuat transaksi baru
    const handleBuy = async (itemId: number) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transaction/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` // wajib kirim token karena endpoint diproteksi
                },
                body: JSON.stringify({
                    user_id: user.id,
                    item_id: itemId,
                    quantity: 1,
                    description: "Pembelian dari web frontend"
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                alert("Gagal membuat transaksi: " + data.message);
                return;
            }

            router.push("/transactions");
        } catch (err) {
            alert("Terjadi kesalahan sistem saat membuat transaksi.");
        }
    };

    const formatRupiah = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency", currency: "IDR", maximumFractionDigits: 0,
        }).format(price);
    };

    if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-xl">Memuat barang...</p></div>;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <nav className="bg-yellow-400 p-4 shadow-md">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">UI Store</h1>
                    <div className="flex gap-4 items-center">
                        {/* link baru ke halaman Profil */}
                        <Link href="/profile" className="text-gray-800 font-semibold hover:text-gray-600">
                            Profil Saya
                        </Link>

                        <Link href="/transactions" className="text-gray-800 font-semibold hover:text-gray-600">
                            Riwayat Transaksi
                        </Link>
                        <button onClick={handleLogout} className="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto p-6 mt-8">
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Daftar Barang</h2>
                        <p className="text-gray-600 mt-2">Halo {user?.name}, saldo Anda: <span className="font-bold text-yellow-600">{formatRupiah(user?.balance || 0)}</span></p>
                    </div>
                </div>

                {error && <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-200 flex flex-col">
                            <div className="h-48 bg-white flex items-center justify-center overflow-hidden relative border-b border-gray-100">
                                <img
                                    src={`/${item.name.toLowerCase()}.png`}
                                    alt={item.name}
                                    className="w-full h-full object-contain p-4 transition-transform duration-300 hover:scale-105"
                                    onError={(e) => { e.currentTarget.src = `https://placehold.co/400x300/ffcc00/ffffff?text=${item.name}`; }}
                                />
                            </div>

                            <div className="p-5 flex flex-col flex-grow">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                                <div className="mt-auto">
                                    <p className="text-2xl font-bold text-yellow-600 mb-3">{formatRupiah(item.price)}</p>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className={`px-2 py-1 rounded-md font-medium ${item.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {item.stock > 0 ? `Stok: ${item.stock}` : 'Habis'}
                                        </span>
                                        <button
                                            onClick={() => handleBuy(item.id)} // Menjalankan fungsi handleBuy
                                            disabled={item.stock === 0}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${item.stock > 0 ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-900' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                                        >
                                            Beli
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}