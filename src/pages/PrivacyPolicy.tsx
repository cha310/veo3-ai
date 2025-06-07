import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy | Veo 3</h1>
        <div className="text-gray-400 mb-12">
          <p>Posted on: June 07, 2025</p>
          <p>Last updated: June 07, 2025</p>
        </div>

        <section className="mb-10">
          <p className="mb-4">
            At VEOAI we are committed to protecting the privacy and security of our users. Understanding the importance of 
            privacy, we strive to ensure that our data collection, usage, and sharing practices respect your privacy rights.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Data Collection</h2>
          <p className="mb-4">
            We collect data to enhance your experience and improve our service, utilizing basic, anonymous analytics to 
            understand user behavior without gathering any personally identifiable information (PII). The data we collect 
            encompasses:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>
              <span className="font-semibold">Usage data</span>, which includes information on how you interact with the website, such as page visits and 
              interaction metrics.
            </li>
            <li>
              <span className="font-semibold">Anonymous device information</span> to help us optimize our platform for all users, noting the type of device and 
              browser used to access our website.
            </li>
            <li>
              <span className="font-semibold">Cookies</span> to improve the user experience, facilitating features like remembering login details and preferences.
            </li>
          </ul>
          <p className="mb-4">
            You have the flexibility to manage or disable cookies through your browser settings, ensuring control over your 
            personal data and how it's used to enhance your browsing experience.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Use of Data</h2>
          <p className="mb-4">
            The primary purpose behind our data collection efforts is to enhance our website and customize it to better serve 
            our users' needs. By analyzing the data, we aim to:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Improve website functionality and user experience</li>
            <li>Gain insights into user engagement and interaction patterns</li>
            <li>Make informed decisions about introducing new features and services</li>
          </ul>
          <p className="mb-4">
            It's important to note that we do not use this data for commercial purposes, nor do we sell any information 
            collected from our users.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Data Sharing</h2>
          <p className="mb-4">
            We are committed to not sharing any data collected from our users with third parties, except as required by law. 
            Any data sharing will only occur under strict conditions and with your explicit consent.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Your Rights</h2>
          <p className="mb-4">
            Your privacy is our top priority, and we are committed to ensuring you have full control over your personal data. 
            As part of this commitment, you are entitled to various rights including:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>The right to access any personal data we hold about you</li>
            <li>The right to rectify any inaccuracies in your personal data</li>
            <li>The right to request the erasure of your personal data from our records</li>
            <li>The right to opt out of data analytics and cookies to prevent data collection during your visits</li>
          </ul>
          <p className="mb-4">
            If you wish to exercise any of these rights, please reach out to our website administrator using the contact 
            information available on our website.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Changes to This Privacy Policy</h2>
          <p className="mb-4">
            We reserve the right to update our Privacy Policy to reflect changes in our practices or for other operational, legal, 
            or regulatory reasons. We encourage you to review this policy periodically for any updates.
          </p>
          <p className="mb-4">
            By using our website, you acknowledge that you have read and understand this Privacy Policy. For any questions 
            or concerns regarding this policy or your personal data, please contact us directly.
          </p>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy; 