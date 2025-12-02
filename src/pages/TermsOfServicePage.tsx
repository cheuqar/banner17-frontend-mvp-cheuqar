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
 * TermsOfServicePage - Terms of Service for Banner17
 * Following Style4-V2 design system
 */
const TermsOfServicePage: React.FC = () => {
  const lastUpdated = 'December 2025';

  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: `Welcome to Banner17. These Terms of Service ("Terms") govern your access to and use of the Banner17 website, mobile applications, and related services (collectively, the "Services") operated by Banner17 Limited ("Banner17", "we", "us", or "our"), a company incorporated in Hong Kong.

Our Services provide an AI-powered global property search platform, currently operating in Australia with planned expansion to New Zealand, the United Kingdom, and other markets.

By accessing or using our Services, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you must not access or use our Services.

We may modify these Terms at any time. Your continued use of the Services after any changes constitutes acceptance of the modified Terms.`
    },
    {
      title: '2. Eligibility and Account Registration',
      content: `**Eligibility**
To use our Services, you must:
- Be at least 18 years of age (or the age of majority in your jurisdiction)
- Have the legal capacity to enter into binding contracts
- Not be prohibited from using the Services under applicable law in your jurisdiction

**Account Registration**
To access certain features, you must create an account. You agree to:
- Provide accurate and complete information
- Maintain the security of your account credentials
- Notify us immediately of any unauthorised access
- Accept responsibility for all activities under your account

We reserve the right to suspend or terminate accounts that violate these Terms.`
    },
    {
      title: '3. Description of Services',
      content: `Banner17 provides an AI-powered property search platform that enables users to:
- Search for residential and commercial properties using natural language
- Save and manage property shortlists
- Receive personalised property recommendations
- Access property information and market insights
- Connect with real estate professionals

**Service Availability**
We strive to maintain continuous availability but do not guarantee uninterrupted access. We may modify, suspend, or discontinue any aspect of the Services at any time.

**Market Coverage**
Our Services currently cover Australia, with planned expansion to:
- New Zealand (Coming Soon)
- United Kingdom (Coming Soon)
- Additional markets to be announced

Property data availability and features may vary by market.

**AI-Powered Features**
Our Services use artificial intelligence to process search queries and provide recommendations. While we aim for accuracy, AI-generated results may not always be complete or error-free.`
    },
    {
      title: '4. Property Information Disclaimer',
      content: `**Information Accuracy**
Property information displayed on our Services is sourced from third-party providers, including real estate agents, property developers, and public records in each market. We do not:
- Guarantee the accuracy, completeness, or currency of property information
- Verify property details, prices, availability, or legal status
- Provide property valuations or investment advice

**Independent Verification**
You must independently verify all property information before making any decisions. This includes:
- Property features, dimensions, and condition
- Pricing and availability
- Legal title and encumbrances
- Zoning, planning, and building restrictions
- Compliance with local regulations and certifications

**No Real Estate Advice**
Banner17 is a technology platform, not a real estate agency. We do not:
- Provide real estate, legal, financial, or investment advice
- Act as an agent for buyers or sellers
- Guarantee property transactions or outcomes

Local real estate laws and regulations vary by jurisdiction. You should seek professional advice relevant to your location.`
    },
    {
      title: '5. User Conduct',
      content: `When using our Services, you agree not to:

**Prohibited Activities**
- Violate any applicable laws or regulations in any jurisdiction
- Infringe the intellectual property rights of others
- Submit false, misleading, or fraudulent information
- Harass, abuse, or harm other users
- Interfere with or disrupt the Services
- Attempt to gain unauthorised access to systems or data
- Use automated tools to scrape or collect data
- Circumvent security measures or access controls

**Content Standards**
Any content you submit must not:
- Be defamatory, obscene, or offensive
- Contain malware or malicious code
- Spam or advertise without authorisation
- Impersonate others or misrepresent your identity

We reserve the right to remove content and suspend accounts that violate these standards.`
    },
    {
      title: '6. Intellectual Property',
      content: `**Our Intellectual Property**
All content, features, and functionality of the Services, including:
- Website design, layout, and graphics
- Software, algorithms, and AI models
- Text, images, logos, and trademarks
- Database structures and compilations

are owned by Banner17 or our licensors and protected by Hong Kong and international intellectual property laws.

**Limited License**
We grant you a limited, non-exclusive, non-transferable license to access and use the Services for personal, non-commercial purposes in accordance with these Terms.

**Restrictions**
You may not:
- Copy, modify, or distribute our content without permission
- Reverse engineer or decompile our software
- Use our trademarks without written consent
- Create derivative works based on our Services

**User Content**
You retain ownership of content you submit but grant us a worldwide, royalty-free license to use, display, and distribute such content in connection with the Services.`
    },
    {
      title: '7. Third-Party Services and Links',
      content: `Our Services may contain links to third-party websites, applications, or services, including:
- Real estate agency websites
- Property listing portals
- Financial service providers
- Social media platforms

**Third-Party Terms**
Your use of third-party services is subject to their own terms and privacy policies. We are not responsible for:
- The content or practices of third parties
- Any transactions you conduct with third parties
- Loss or damage arising from third-party services

**Real Estate Professionals**
When you enquire about a property, you may be connected with real estate agents or other professionals in that market. Any relationship with these professionals is independent of Banner17 and subject to local regulations.`
    },
    {
      title: '8. Fees and Payment',
      content: `**Free Services**
Basic property search features are provided free of charge.

**Premium Services**
We may offer premium features or subscriptions for a fee. If you purchase premium services:
- Prices will be clearly displayed before purchase (in your local currency where available)
- Payment is due at the time of purchase
- Fees are generally non-refundable unless required by law
- We may change pricing with reasonable notice

**Consumer Protection**
Your rights as a consumer under local laws are not affected by these Terms. This includes rights under:
- Hong Kong Consumer Council guidelines
- Australian Consumer Law
- UK Consumer Rights Act (when applicable)
- Other local consumer protection laws`
    },
    {
      title: '9. Limitation of Liability',
      content: `**Disclaimer of Warranties**
To the maximum extent permitted by law, the Services are provided "as is" without warranties of any kind. We disclaim all warranties, express or implied, including:
- Merchantability and fitness for a particular purpose
- Accuracy, reliability, or completeness of information
- Uninterrupted or error-free operation
- Security from viruses or harmful components

**Limitation of Liability**
To the maximum extent permitted by law, Banner17 and its directors, employees, and agents will not be liable for:
- Indirect, incidental, or consequential damages
- Loss of profits, data, or business opportunities
- Damages arising from property transactions
- Reliance on property information or AI recommendations

Our maximum liability for any claim is limited to the fees you paid us in the 12 months preceding the claim, or HKD 1,000, whichever is greater.

**Exceptions**
These limitations do not apply to liability that cannot be excluded under applicable law, including liability for:
- Fraud or fraudulent misrepresentation
- Death or personal injury caused by negligence
- Statutory consumer guarantees`
    },
    {
      title: '10. Indemnification',
      content: `You agree to indemnify and hold harmless Banner17 and its directors, employees, and agents from any claims, damages, losses, and expenses (including legal fees) arising from:
- Your use of the Services
- Your violation of these Terms
- Your infringement of third-party rights
- Content you submit to the Services
- Your property transactions or dealings with third parties`
    },
    {
      title: '11. Termination',
      content: `**Termination by You**
You may close your account at any time through account settings or by contacting us.

**Termination by Us**
We may suspend or terminate your access to the Services:
- For violation of these Terms
- For fraudulent or illegal activity
- For extended periods of inactivity
- At our discretion with reasonable notice

**Effect of Termination**
Upon termination:
- Your right to access the Services ceases immediately
- We may delete your account data (subject to legal retention requirements)
- Provisions that should survive termination will remain in effect`
    },
    {
      title: '12. Dispute Resolution',
      content: `**Governing Law**
These Terms are governed by the laws of the Hong Kong Special Administrative Region.

**Jurisdiction**
For disputes arising from your use of the Services:
- If you are located in Hong Kong: Hong Kong courts have exclusive jurisdiction
- If you are located elsewhere: You may bring claims in Hong Kong or in the courts of your country of residence

**Informal Resolution**
Before initiating legal proceedings, you agree to contact us and attempt to resolve any dispute informally for at least 30 days.

**Alternative Dispute Resolution**
We may agree to resolve disputes through mediation or arbitration administered by the Hong Kong International Arbitration Centre (HKIAC).`
    },
    {
      title: '13. Market-Specific Terms',
      content: `**Australia**
For users in Australia, nothing in these Terms excludes, restricts, or modifies any consumer guarantee, right, or remedy under the Australian Consumer Law that cannot be excluded, restricted, or modified by agreement.

**New Zealand (Coming Soon)**
When we launch in New Zealand, we will comply with the Consumer Guarantees Act 1993 and Fair Trading Act 1986.

**United Kingdom (Coming Soon)**
When we launch in the United Kingdom, we will comply with the Consumer Rights Act 2015 and other applicable UK consumer protection laws.

**Other Markets**
As we expand to additional markets, we will update these Terms to include relevant local provisions and comply with local regulations.`
    },
    {
      title: '14. General Provisions',
      content: `**Entire Agreement**
These Terms, together with our Privacy Policy, constitute the entire agreement between you and Banner17 regarding the Services.

**Severability**
If any provision of these Terms is found unenforceable, the remaining provisions will continue in effect.

**Waiver**
Our failure to enforce any right or provision does not constitute a waiver of that right or provision.

**Assignment**
You may not assign your rights under these Terms. We may assign our rights to any affiliate or successor.

**Language**
These Terms are provided in English. If translated into other languages, the English version prevails in case of conflict.

**Notices**
We may provide notices via email, in-app notifications, or posting on our website. You may contact us using the details below.`
    },
    {
      title: '15. Contact Information',
      content: `If you have questions about these Terms of Service, please contact us:

**Banner17 Limited**
Website: www.banner17.ai
Email: legal@banner17.ai

For general enquiries: support@banner17.ai
For privacy matters: privacy@banner17.ai`
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
          Terms of Service
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

        {/* Terms Sections */}
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

export default TermsOfServicePage;
