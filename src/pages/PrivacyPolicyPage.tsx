import React from 'react';
import {
  Box,
  Container,
  Typography,
  Divider
} from '@mui/material';
import HeaderStyle4V2 from '../components/style4-v2/HeaderStyle4V2';
import FooterStyle4V2 from '../components/style4-v2/FooterStyle4V2';

/**
 * PrivacyPolicyPage - Privacy Policy for Banner17
 * Following Style4-V2 design system
 */
const PrivacyPolicyPage: React.FC = () => {
  const lastUpdated = 'December 2025';

  const sections = [
    {
      title: '1. About This Policy',
      content: `This Privacy Policy explains how Banner17 Limited ("Banner17", "we", "us", or "our"), a company incorporated in Hong Kong, collects, uses, discloses, and protects your personal information when you use our website, mobile applications, and services (collectively, the "Services").

We operate a global property search platform, currently serving Australia with planned expansion to New Zealand, the United Kingdom, and other markets. We are committed to protecting your privacy and handling your personal information in accordance with:
- The Personal Data (Privacy) Ordinance (Cap. 486) of Hong Kong
- The Privacy Act 1988 (Cth) of Australia
- The General Data Protection Regulation (GDPR) for users in the European Economic Area
- Other applicable data protection laws in jurisdictions where we operate

By using our Services, you consent to the collection, use, and disclosure of your personal information as described in this Privacy Policy.`
    },
    {
      title: '2. Information We Collect',
      content: `We collect the following types of information:

**Personal Information You Provide**
- Account information: name, email address, phone number, and password
- Profile information: property preferences, search criteria, saved properties
- Location preferences: countries and regions you're interested in
- Communication data: messages, enquiries, and feedback you send us
- Payment information: billing details for premium services

**Information Collected Automatically**
- Device information: IP address, browser type, operating system
- Usage data: pages visited, search queries, features used, time spent
- Location data: general location based on IP address (with your consent)
- Cookies and similar technologies: preferences, session data

**Information from Third Parties**
- Property data from real estate listings providers in each market
- Public records and government databases
- Social media profiles (if you connect your accounts)`
    },
    {
      title: '3. How We Use Your Information',
      content: `We use your personal information to:

**Provide Our Services**
- Display property listings matching your search criteria across available markets
- Enable AI-powered natural language property search
- Save and manage your property shortlists and preferences
- Process transactions and provide customer support

**Improve Our Services**
- Analyse usage patterns to enhance user experience
- Develop new features and expand to new markets
- Train and improve our AI search algorithms
- Conduct research and analytics

**Communicate With You**
- Send property alerts and recommendations
- Provide updates about our Services and new market launches
- Respond to your enquiries and requests
- Send marketing communications (with your consent)

**Legal and Security Purposes**
- Comply with legal obligations in applicable jurisdictions
- Protect against fraud and security threats
- Enforce our Terms of Service`
    },
    {
      title: '4. Sharing Your Information',
      content: `We may share your personal information with:

**Service Providers**
Third-party companies that help us operate our Services, including:
- Cloud hosting and data storage providers
- Analytics and performance monitoring services
- Payment processors
- Customer support platforms

**Real Estate Professionals**
When you enquire about a property, we may share your contact details with:
- Real estate agents listing the property
- Property developers and builders
- Mortgage brokers (with your consent)

**Affiliated Companies**
We may share information with our affiliated companies for the purposes described in this policy.

**Legal Requirements**
We may disclose your information:
- To comply with legal processes or government requests in any applicable jurisdiction
- To protect our rights, privacy, safety, or property
- In connection with a merger, acquisition, or sale of assets

We do not sell your personal information to third parties for their marketing purposes.`
    },
    {
      title: '5. International Data Transfers',
      content: `As a global platform headquartered in Hong Kong, your personal information may be transferred to and processed in countries outside your country of residence, including:
- Hong Kong (our headquarters)
- Australia (our primary market)
- United States (cloud service providers)
- Other countries where our service providers operate

We ensure appropriate safeguards are in place for international transfers, including:
- Standard contractual clauses approved by relevant authorities
- Compliance with applicable cross-border data transfer requirements
- Security standards meeting international best practices

For users in the European Economic Area, we comply with GDPR requirements for international data transfers.`
    },
    {
      title: '6. Data Security',
      content: `We implement industry-standard security measures to protect your personal information:

- Encryption of data in transit (TLS/SSL) and at rest (AES-256)
- Secure authentication and access controls
- Regular security audits and vulnerability testing
- Employee training on data protection practices
- Incident response procedures
- Data centres with ISO 27001 certification

While we take reasonable steps to protect your information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.`
    },
    {
      title: '7. Your Rights and Choices',
      content: `Depending on your location, you may have the following rights:

**Access and Correction**
You can access and update your personal information through your account settings or by contacting us.

**Deletion**
You can request deletion of your account and personal information, subject to legal retention requirements.

**Data Portability**
You can request a copy of your personal data in a structured, commonly used format.

**Restriction and Objection**
You can request restriction of processing or object to certain processing activities.

**Marketing Preferences**
You can opt out of marketing communications at any time by:
- Clicking "unsubscribe" in marketing emails
- Updating your notification settings
- Contacting us directly

**Cookies**
You can manage cookie preferences through your browser settings or our cookie consent tool.

**Complaints**
If you believe we have breached your privacy, you can lodge a complaint with us or the relevant data protection authority:
- Hong Kong: Office of the Privacy Commissioner for Personal Data
- Australia: Office of the Australian Information Commissioner (OAIC)
- UK/EEA: Your local data protection authority`
    },
    {
      title: '8. Data Retention',
      content: `We retain your personal information for as long as:
- Your account remains active
- Necessary to provide our Services
- Required by law or for legitimate business purposes

When you delete your account, we will delete or anonymise your personal information within 30 days, except where retention is required for legal, accounting, or fraud prevention purposes.

Retention periods may vary by jurisdiction based on local legal requirements.`
    },
    {
      title: '9. Children\'s Privacy',
      content: `Our Services are not intended for children under 18 years of age (or the age of majority in your jurisdiction). We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.`
    },
    {
      title: '10. Market-Specific Provisions',
      content: `**Australia**
We comply with the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs). Australian users have additional rights under Australian Consumer Law.

**New Zealand (Coming Soon)**
We will comply with the Privacy Act 2020 when we launch in New Zealand.

**United Kingdom (Coming Soon)**
We will comply with the UK GDPR and Data Protection Act 2018 when we launch in the United Kingdom.

**Other Markets**
As we expand to additional markets, we will update this policy to include relevant local provisions.`
    },
    {
      title: '11. Changes to This Policy',
      content: `We may update this Privacy Policy from time to time. We will notify you of material changes by:
- Posting the updated policy on our website
- Sending you an email notification
- Displaying a notice within our Services

Your continued use of our Services after changes take effect constitutes acceptance of the updated policy.`
    },
    {
      title: '12. Contact Us',
      content: `If you have questions about this Privacy Policy or our privacy practices, please contact us:

**Banner17 Limited**
Website: www.banner17.ai
Email: privacy@banner17.ai

For general enquiries: support@banner17.ai
For data protection matters: dpo@banner17.ai

**Data Protection Officer**
For privacy-related complaints or to exercise your data protection rights, you may contact our Data Protection Officer at dpo@banner17.ai`
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      {/* Header */}
      <HeaderStyle4V2 />

      {/* Main Content */}
      <Container maxWidth="md" sx={{ py: { xs: 8, md: 12 } }}>
        {/* Page Title */}
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: { xs: '2rem', md: '2.5rem' },
            fontWeight: 700,
            color: '#000000',
            mb: 2,
            textAlign: 'center',
          }}
        >
          Privacy Policy
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: '#666666',
            textAlign: 'center',
            mb: 6,
          }}
        >
          Last updated: {lastUpdated}
        </Typography>

        <Divider sx={{ mb: 6 }} />

        {/* Policy Sections */}
        {sections.map((section, index) => (
          <Box key={index} sx={{ mb: 5 }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#000000',
                mb: 2,
              }}
            >
              {section.title}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#333333',
                lineHeight: 1.8,
                whiteSpace: 'pre-line',
                '& strong': {
                  fontWeight: 600,
                  color: '#000000',
                },
              }}
              dangerouslySetInnerHTML={{
                __html: section.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              }}
            />
          </Box>
        ))}
      </Container>

      {/* Footer */}
      <FooterStyle4V2 />
    </Box>
  );
};

export default PrivacyPolicyPage;
