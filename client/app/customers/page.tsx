"use client";

import React, { useEffect, useState } from 'react';
import { customersApi, Customer, CustomerSummary } from '../../lib/api/customers';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useToast } from '../../hooks/use-toast';
import { ArrowLeft, Plus, Search, Users, DollarSign, Phone, Mail, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MobileNavigation from '../components/MobileNavigation';

export default function CustomersPage() {
	const { toast } = useToast();
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [summary, setSummary] = useState<CustomerSummary[]>([]);
	const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({ name: "" });
	const [loading, setLoading] = useState(false);

	const load = async () => {
		setLoading(true);
		try {
			const [list, sum] = await Promise.all([
				customersApi.list(query),
				customersApi.debtsSummary()
			]);
			setCustomers(list);
			setSummary(sum);
		} catch (e: any) {
			toast({ title: 'Error', description: e?.message || 'Failed to load customers', variant: 'destructive' });
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { load(); }, []);

	const createCustomer = async () => {
		if (!newCustomer.name) return;
		try {
			const created = await customersApi.create(newCustomer);
			toast({ title: 'Customer created', description: created.name });
			setNewCustomer({ name: "" });
			await load();
		} catch (e: any) {
			toast({ title: 'Error', description: e?.message || 'Failed to create customer', variant: 'destructive' });
		}
	};

	// Show loading overlay before any page content if loading is true
	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-emerald-50 to-slate-50">
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
					<div className="flex flex-col items-center gap-4">
						<svg
							className="animate-spin h-10 w-10 text-emerald-500"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							></circle>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
							></path>
						</svg>
						<span className="text-emerald-700 font-semibold text-lg">
							Loading...
						</span>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-screen bg-gradient-to-b from-emerald-50 to-slate-50">
			{/* Mobile Header */}
			<header className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-40 shadow-sm xs-reduce-header-padding xs-reduce-padding">
				<div className="flex items-center gap-4">
					<Button 
						variant="ghost" 
						size="icon" 
						className="rounded-full xs-touch-target"
						onClick={() => router.back()}
					>
						<ArrowLeft className="w-5 h-5" />
					</Button>
					<div className="flex-1 xs-text-adjust">
						<h1 className="text-xl font-bold text-slate-800">Customers</h1>
						<p className="text-sm text-slate-500">Manage customer records and outstanding debts</p>
					</div>
				</div>
			</header>

			{/* Content */}
			<div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24 xs-reduce-padding">
				{/* Summary Cards */}
				<div className="grid grid-cols-2 gap-3 xs-single-col">
					<Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
						<CardContent className="p-4">
							<div className="space-y-1">
								<p className="text-emerald-100 text-sm">Total Customers</p>
								<p className="text-2xl font-bold">{customers.length}</p>
								<p className="text-emerald-100 text-xs">
									{summary.length} with debts
								</p>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
						<CardContent className="p-4">
							<div className="space-y-1">
								<p className="text-orange-100 text-sm">Outstanding Debts</p>
								<p className="text-2xl font-bold">
									₦{summary.reduce((sum, s) => sum + Number(s.outstanding), 0).toLocaleString()}
								</p>
								<p className="text-orange-100 text-xs">
									Total amount owed
								</p>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Search and Quick Create */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base flex items-center gap-2">
							<Search className="w-5 h-5" />
							Find or Add Customer
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="relative">
							<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
							<Input 
								placeholder="Search by name or phone" 
								value={query} 
								onChange={e => setQuery(e.target.value)} 
								className="pl-12 h-12 text-base rounded-xl" 
							/>
						</div>
						
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<Input 
								placeholder="Name" 
								value={newCustomer.name || ''} 
								onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} 
								className="h-12 rounded-xl" 
							/>
							<Input 
								placeholder="Phone" 
								value={newCustomer.phone || ''} 
								onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })} 
								className="h-12 rounded-xl" 
							/>
						</div>
						
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<Input 
								placeholder="Email" 
								value={newCustomer.email || ''} 
								onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} 
								className="h-12 rounded-xl" 
							/>
							<Input 
								placeholder="Address" 
								value={newCustomer.address || ''} 
								onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })} 
								className="h-12 rounded-xl" 
							/>
						</div>
						
						<Button 
							onClick={createCustomer} 
							disabled={!newCustomer.name} 
							className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl"
						>
							<Plus className="w-5 h-5 mr-2" />
							Add Customer
						</Button>
					</CardContent>
				</Card>

				{/* Debts Summary */}
				<Card className="bg-white">
					<CardHeader>
						<CardTitle className="text-base flex items-center gap-2">
							<DollarSign className="w-5 h-5" />
							Outstanding Debts by Customer
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							<table className="w-full text-left">
								<thead>
									<tr>
										<th className="py-2 font-medium text-slate-700">Customer</th>
										<th className="py-2 font-medium text-slate-700">Outstanding</th>
										<th className="py-2 font-medium text-slate-700">Last Activity</th>
									</tr>
								</thead>
								<tbody>
									{summary.map((s, idx) => (
										<tr key={idx} className="border-t border-slate-100">
											<td className="py-3 font-medium text-slate-800">{s.customer_name || 'Unnamed'}</td>
											<td className="py-3 text-red-600 font-semibold">₦{Number(s.outstanding).toFixed(2)}</td>
											<td className="py-3 text-slate-600 text-sm">{new Date(s.last_activity).toLocaleString()}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>

				{/* Customers List */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base flex items-center gap-2">
							<Users className="w-5 h-5" />
							All Customers ({customers.length})
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							{customers.map(c => (
								<Card key={c.id} className="hover:shadow-md transition-all duration-300 active:scale-95 border-slate-200">
									<CardContent className="p-4">
										<div className="space-y-2">
											<div className="font-semibold text-slate-800 text-lg">{c.name}</div>
											{c.phone && (
												<div className="flex items-center gap-2 text-sm text-slate-600">
													<Phone className="w-4 h-4" />
													<span>{c.phone}</span>
												</div>
											)}
											{c.email && (
												<div className="flex items-center gap-2 text-sm text-slate-600">
													<Mail className="w-4 h-4" />
													<span>{c.email}</span>
												</div>
											)}
											{c.address && (
												<div className="flex items-center gap-2 text-sm text-slate-600">
													<MapPin className="w-4 h-4" />
													<span className="truncate">{c.address}</span>
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Mobile Navigation */}
			<MobileNavigation />
		</div>
	);
}
