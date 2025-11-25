export const createBugReport = async (req, res) => {
  try {
    const userId = req.userId || 'anonymous';
    const {
      subject = 'Bug Report',
      description = '',
      steps = '',
      expected = '',
      actual = '',
      severity = 'medium',
      browser = '',
      os = '',
      contact = ''
    } = req.body || {};

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    // For now, just log the bug to the server console.
    // This can later be persisted to DB or forwarded to an issue tracker / email.
    const payload = {
      reportedAt: new Date().toISOString(),
      userId,
      subject,
      description,
      steps,
      expected,
      actual,
      severity,
      browser,
      os,
      contact,
    };
    console.log('🐞 Bug report received:', JSON.stringify(payload, null, 2));

    return res.json({ success: true, message: 'Bug report submitted. Thank you!' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to submit bug report' });
  }
};

