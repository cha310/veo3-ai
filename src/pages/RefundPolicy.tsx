import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const RefundPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">Refund Policy | VEOAI</h1>
        <div className="text-gray-400 mb-12">
          <p>Posted on: June 07, 2025</p>
          <p>Last updated: June 07, 2025</p>
        </div>

        <section className="mb-10">
          <p className="mb-4">
            At VEOAI, we aim to ensure complete satisfaction with our services. This policy outlines our terms and conditions 
            for subscription plan changes and refunds.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Subscription Refunds</h2>
          <p className="mb-4">
            We offer full refunds for subscription purchases under the following conditions:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Request must be made within 3 days of purchase</li>
            <li>Usage must be limited to 200 credits or fewer</li>
            <li>Processing fees will be deducted from the refund amount</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Credit Purchases</h2>
          <p className="mb-4">
            Credit purchases are non-refundable. Please carefully consider your credit needs before making a purchase, as 
            we cannot provide refunds for any credits once purchased, regardless of usage status.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Subscription Plan Changes</h2>
          <p className="mb-4">
            If you have accidentally purchased an annual subscription plan instead of a monthly plan, we offer the following 
            accommodation:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>We will convert your annual plan to a monthly plan</li>
            <li>One month of subscription fee plus processing fees will be deducted</li>
            <li>The remaining balance will be refunded to your original payment method</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Non-Refundable Items</h2>
          <p className="mb-4">
            The following items are not eligible for refunds under any circumstances:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Credit purchases</li>
            <li>Subscription time that has already passed</li>
            <li>Processing fees</li>
            <li>Subscriptions beyond the 3-day window</li>
            <li>Subscriptions with more than 10 credits used</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Refund Process</h2>
          <p className="mb-4">
            To request a refund for eligible items, please contact our support team with the following information:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Your account email</li>
            <li>Order number or transaction ID</li>
            <li>Reason for the refund request</li>
            <li>Date of purchase</li>
          </ul>
          <p className="mb-4">
            Refund requests are typically processed within 5-7 business days. The actual time for the refund to appear in your 
            account may vary depending on your payment method and financial institution.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Changes to This Refund Policy</h2>
          <p className="mb-4">
            We reserve the right to update our Refund Policy to reflect changes in our practices or for other operational, legal, 
            or regulatory reasons. We encourage you to review this policy periodically for any updates.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
          <p className="mb-4">
            If you have any questions about our refund policy or need to request a refund, please contact our support team at 
            support@veo3-ai.net.
          </p>
          <p className="mb-4">
            By using our services, you acknowledge that you have read and understand this Refund Policy.
          </p>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default RefundPolicy; 