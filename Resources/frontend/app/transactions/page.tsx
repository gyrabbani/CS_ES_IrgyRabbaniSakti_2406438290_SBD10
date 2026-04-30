"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Transaction {
    id: number;
    item_name: string;
    item_price: number;
    quantity: number;
    total: number;
    status: string;
    created_at: string;
}

export default function TransactionsPage() {
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    const fetchTransactions = async (userId: number) => {
        try {
            // Backend menggunakan query params untuk mengambil history user_id
            const response = await fetch(`http://process.env.NEXT_PUBLIC_API_URL/user/history?user_id=${userId}`);
            const data = await response.json();
            if (data.success) {
                setTransactions(data.payload);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
            router.push("/login");
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        fetchTransactions(parsedUser.id);
    }, [router]);

    const handlePay = async (transactionId: number) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://process.env.NEXT_PUBLIC_API_URL/transaction/pay/${transactionId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                alert(data.message || "Pembayaran gagal. Saldo mungkin tidak cukup.");
                return;
            }

            alert("Pembayaran Berhasil!");

            // Update saldo di localStorage
            const updatedUser = { ...user, balance: data.payload.newBalance };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);

            // Refresh daftar transaksi
            fetchTransactions(user.id);
        } catch (err) {
            alert("Terjadi kesalahan saat memproses pembayaran.");
        }
    };

    const formatRupiah = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency", currency: "IDR", maximumFractionDigits: 0,
        }).format(price);
    };

    if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>Memuat riwayat...</p></div>;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <nav className="bg-yellow-400 p-4 shadow-md">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">SBD Store</h1>
                    <Link href="/items" className="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                        Kembali Belanja
                    </Link>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto p-6 mt-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Riwayat Transaksi</h2>
                    <p className="text-gray-600 mt-2">Saldo Anda saat ini: <span className="font-bold text-yellow-600">{formatRupiah(user?.balance || 0)}</span></p>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                    {transactions.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">Belum ada transaksi. Ayo mulai belanja!</div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {transactions.map((trx) => (
                                <li key={trx.id} className="p-6 hover:bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{trx.item_name} <span className="text-sm font-normal text-gray-500">(x{trx.quantity})</span></h3>
                                        <p className="text-sm text-gray-500 mt-1">{new Date(trx.created_at).toLocaleString('id-ID')}</p>
                                        <p className="text-lg font-bold text-yellow-600 mt-2">{formatRupiah(trx.total)}</p>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${trx.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {trx.status}
                                        </span>

                                        {trx.status === 'pending' && (
                                            <button
                                                onClick={() => handlePay(trx.id)}
                                                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg font-semibold transition-colors mt-2"
                                            >
                                                Bayar Sekarang
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </main>
        </div>
    );
}