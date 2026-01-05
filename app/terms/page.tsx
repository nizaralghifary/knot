const TermsAndConditions = () => {
  return (
    <section className="max-w-5xl mx-auto sm:p-16 pb-12 !pt-[20px] px-8 min-h-[calc(100vh-80px)] dark:text-white">
      <div className="mt-5">
        <h2 className="sm:text-4xl text-2xl font-bold">Terms of Service</h2>
        <p className="mt-4 text-lg">Last Updated: January 5, 2026</p>

        <p className="mt-4 text-lg">Welcome to KnotExam!</p>
        <p className="mt-2">
          KnotExam is an online exam platform designed for schools and teachers to create, manage, and conduct online examinations easily and securely.
        </p>
        <p className="mt-2">
          By accessing or using this website, you agree to these Terms of Service. If you do not agree, please do not use this website.
        </p>

        <h3 className="mt-6 text-xl">1. Use of the Site</h3>
        <p className="mt-2">
          By using KnotExam, you agree to:
        </p>
        <ul className="list-disc pl-5 mt-2">
          <li>Use the website only for lawful and educational purposes.</li>
          <li>Not attempt to disrupt, damage, or interfere with the website or its systems.</li>
          <li>Not attempt to access data, accounts, or systems that you are not authorized to access.</li>
        </ul>
        <p className="mt-2">
          We reserve the right to limit or terminate access if we believe these rules are violated.
        </p>

        <h3 className="mt-6 text-xl">2. User Accounts</h3>
        <p className="mt-2">
          To access certain features, you may need to create an account.
        </p>
        <p className="mt-2">
          You are responsible for:
        </p>
        <ul className="list-disc pl-5 mt-2">
          <li>Keeping your passwords secure.</li>
          <li>All activities that occur under your account.</li>
        </ul>
        <p className="mt-2">
          If you believe your account has been compromised, please contact us immediately at <a href="mailto:support@nizaralghifary.my.id" className="text-blue-400 underline">support@nizaralghifary.my.id</a>
        </p>

        <h3 className="mt-6 text-xl">3. Exams and Data</h3>
        <p className="mt-2">
          KnotExam is a platform used to create, manage, and participate in online exams. All exam data and user information are stored securely using our database provider. We do not take ownership of any exam questions or results created by schools or teachers. Users are responsible for the content they create and must ensure it complies with applicable laws.
        </p>

        <h3 className="mt-6 text-xl">4. Limitation of Liability</h3>
        <p className="mt-2">
          This site is provided &quot;as is&quot; without warranties of any kind, either express or implied. We do not guarantee that the site will be error-free or uninterrupted.
        </p>
        <p className="mt-2">
          We are not liable for any direct or indirect damages arising from your use or inability to use the site, including loss of data or profits.
        </p>

        <h3 className="mt-6 text-xl">5. Changes to the Terms</h3>
        <p className="mt-2">
          We may update these Terms of Service from time to time. When we do, the “Last Updated” date will be revised.
        </p>


        <h3 className="mt-6 text-xl">6. Contact</h3>
        <p className="mt-2">
          If you have any questions or concerns regarding these terms, feel free to contact us at <a href="mailto:support@nizaralghifary.my.id" className="text-blue-400 underline">support@nizaralghifary.my.id</a>
        </p>
      </div>
    </section>
  );
};

export default TermsAndConditions;