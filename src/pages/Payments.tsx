
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import PaymentsHeader from "@/components/payments/PaymentsHeader";
import PaymentsStats from "@/components/payments/PaymentsStats";
import TransactionsList from "@/components/payments/TransactionsList";
import PaymentMethods from "@/components/payments/PaymentMethods";
import RecentActivity from "@/components/payments/RecentActivity";

const Payments = () => {
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);

  // Données de démonstration pour les transactions
  const transactions = [
    {
      id: "txn_1234567890",
      orderId: "#1234",
      customer: "Marie Dubois",
      amount: 89.99,
      fee: 2.97,
      net: 87.02,
      status: "Réussi",
      method: "Carte bancaire",
      type: "Paiement",
      date: "2024-01-15",
      time: "14:32",
      gateway: "Stripe",
      reference: "pi_1234567890"
    },
    {
      id: "txn_1234567891",
      orderId: "#1235",
      customer: "Jean Martin",
      amount: 156.50,
      fee: 5.15,
      net: 151.35,
      status: "En cours",
      method: "PayPal",
      type: "Paiement",
      date: "2024-01-15",
      time: "13:45",
      gateway: "PayPal",
      reference: "PAY-1234567891"
    },
    {
      id: "txn_1234567892",
      orderId: "#1236",
      customer: "Sophie Laurent",
      amount: 73.25,
      fee: 2.42,
      net: 70.83,
      status: "Échoué",
      method: "Carte bancaire",
      type: "Paiement",
      date: "2024-01-14",
      time: "16:20",
      gateway: "Stripe",
      reference: "pi_1234567892"
    },
    {
      id: "txn_1234567893",
      orderId: "#1237",
      customer: "Pierre Durand",
      amount: 245.00,
      fee: 8.07,
      net: 236.93,
      status: "Remboursé",
      method: "Carte bancaire",
      type: "Remboursement",
      date: "2024-01-14",
      time: "11:15",
      gateway: "Stripe",
      reference: "re_1234567893"
    },
    {
      id: "txn_1234567894",
      orderId: "#1238",
      customer: "Emma Wilson",
      amount: 124.99,
      fee: 4.12,
      net: 120.87,
      status: "Réussi",
      method: "Carte bancaire",
      type: "Paiement",
      date: "2024-01-13",
      time: "09:30",
      gateway: "Stripe",
      reference: "pi_1234567894"
    }
  ];

  // Méthodes de paiement configurées
  const paymentMethods = [
    {
      id: "stripe",
      name: "Stripe",
      type: "Cartes bancaires",
      status: "Actif",
      fees: "2.9% + 0.30€",
      enabled: true,
      logo: "💳"
    },
    {
      id: "paypal",
      name: "PayPal",
      type: "Portefeuille numérique",
      status: "Actif",
      fees: "3.4% + 0.35€",
      enabled: true,
      logo: "🅿️"
    },
    {
      id: "banktransfer",
      name: "Virement bancaire",
      type: "Transfert",
      status: "Inactif",
      fees: "Gratuit",
      enabled: false,
      logo: "🏦"
    }
  ];

  const totalRevenue = transactions
    .filter(t => t.status === "Réussi" && t.type === "Paiement")
    .reduce((sum, t) => sum + t.net, 0);

  const totalFees = transactions
    .filter(t => t.status === "Réussi")
    .reduce((sum, t) => sum + t.fee, 0);

  const pendingTransactions = transactions.filter(t => t.status === "En cours").length;
  const failedTransactions = transactions.filter(t => t.status === "Échoué").length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PaymentsHeader />

        <PaymentsStats
          totalRevenue={totalRevenue}
          totalFees={totalFees}
          pendingTransactions={pendingTransactions}
          failedTransactions={failedTransactions}
        />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TransactionsList
              transactions={transactions}
              onTransactionSelect={setSelectedTransaction}
            />
          </div>

          <div className="space-y-6">
            <PaymentMethods paymentMethods={paymentMethods} />
            <RecentActivity transactions={transactions} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Payments;
