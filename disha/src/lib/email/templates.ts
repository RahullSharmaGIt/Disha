export function parentConsentEmail({
  studentName,
  consentUrl,
}: {
  studentName: string;
  consentUrl: string;
}) {
  return {
    subject: `Disha - Parental Consent Required for ${studentName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #2563eb;">Disha (दिशा) — Career Guidance Platform</h2>
        <p>Hello,</p>
        <p>Your child <strong>${studentName}</strong> has registered on Disha, a career guidance platform for students in Classes 9–12.</p>
        <p>Under India's Digital Personal Data Protection Act (DPDPA), we require verifiable parental consent before your child can save quiz assessments and receive personalized recommendations.</p>
        <p>By clicking the button below, you consent to Disha processing your child's stream and career quiz responses exclusively for career matching.</p>
        <p style="margin: 28px 0;">
          <a href="${consentUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Grant Consent</a>
        </p>
        <p style="color: #6b7280; font-size: 13px;">This verification link will remain active for 7 days. If you did not recognize this request, you may safely disregard this email.</p>
        <p style="color: #6b7280; font-size: 13px;">Privacy commitment: We strictly minimize student data collection and do not engage in behavioral tracking or targeted advertising.</p>
      </div>
    `,
  };
}

export function contributorInviteEmail({
  inviteUrl,
}: {
  inviteUrl: string;
}) {
  return {
    subject: "You're invited to contribute to Disha (दिशा)",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #2563eb;">Disha (दिशा) — Career Guidance Platform</h2>
        <p>Hello,</p>
        <p>You have been invited to become an approved contributor on Disha.</p>
        <p>As a contributor, you will be able to author and submit career roadmaps, prerequisites, and curated learning resources that help thousands of high school students across India.</p>
        <p style="margin: 28px 0;">
          <a href="${inviteUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Accept Contributor Invitation</a>
        </p>
      </div>
    `,
  };
}

export function submissionStatusEmail({
  contributorName,
  careerTitle,
  status,
  reviewNotes,
}: {
  contributorName: string;
  careerTitle: string;
  status: 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED';
  reviewNotes?: string;
}) {
  const statusMessages = {
    APPROVED: 'Your submission has been approved and published!',
    CHANGES_REQUESTED: 'Your submission requires updates before publication.',
    REJECTED: 'Your submission was not accepted by the moderation team.',
  };

  return {
    subject: `Disha - Submission Update: ${careerTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #2563eb;">Disha (दिशा) — Moderation Update</h2>
        <p>Hello ${contributorName},</p>
        <p>${statusMessages[status]}</p>
        <p><strong>Item:</strong> ${careerTitle}</p>
        ${reviewNotes ? `<p><strong>Reviewer Notes:</strong> ${reviewNotes}</p>` : ''}
      </div>
    `,
  };
}
