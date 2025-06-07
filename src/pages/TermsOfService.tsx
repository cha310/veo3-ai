import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">Terms of Service | Veo 3</h1>
        <div className="text-gray-400 mb-12">
          <p>Posted on: June 07, 2025</p>
          <p>Last updated: June 07, 2025</p>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">1. Introduction</h2>
          <p className="mb-4">
            This website is operated by VEOAI. Throughout the site, the terms "we", "us", and "our" refer to VEOAI. VEOAI 
            provides this website, including all information, tools, and services available from this site to you, the user, 
            conditioned upon your acceptance of all terms, conditions, policies, and notices stated here.
          </p>
          <p className="mb-4">
            By accessing our site and/or purchasing something from us, you engage in our "Service" and agree to be bound 
            by the following terms and conditions ("Terms of Service"), including those additional terms and conditions and 
            policies referenced herein and/or available by hyperlink. These Terms of Service apply to all users of the site.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">2. Use of the Service</h2>
          <p className="mb-4">
            You are permitted to use this website for browsing the content we have made available. The Service must not be 
            used for any illegal or unauthorized purposes. You agree to comply with all applicable laws, rules, and regulations 
            in connection with your use of the website and its content.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">3. Access</h2>
          <p className="mb-4">
            We reserve the right, at our sole discretion, to withdraw or modify this website and any service or material we 
            provide on the website, without notice. We will not be liable if, for any reason, all or any part of the website is 
            unavailable at any time or for any duration.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">4. Intellectual Property Rights</h2>
          <p className="mb-4">
            All content and materials on this website are the property of VEOAI and are protected by copyright, trademark, and 
            other relevant laws. You may view, copy, and print materials from the website strictly in accordance with these 
            Terms of Service.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">5. Disclaimer of Warranties & Limitations of Liability</h2>
          <p className="mb-4">
            This website, along with all the information, content, and materials, is provided by VEOAI on an "as is" and "as 
            available" basis. VEOAI makes no representations or warranties of any kind, whether express or implied.
          </p>
          <p className="mb-4">
            VEOAI will not be liable for any damages of any kind arising from your use of this website.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">6. Governing Law</h2>
          <p className="mb-4">
            These Terms will be governed by and interpreted in accordance with the laws of the United Kingdom, without 
            regard to its conflict of law provisions.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">7. Changes To Terms of Service</h2>
          <p className="mb-4">
            The most current version of the Terms of Service can always be reviewed on this page. We reserve the right, at 
            our sole discretion, to update, change, or replace any part of these Terms of Service by posting updates and 
            changes to our website.
          </p>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfService; 