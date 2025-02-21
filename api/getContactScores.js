const axios = require("axios");

module.exports = async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://wheel.makingofyour.life');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { cid } = req.query; 
    if (!cid) {
      return res.status(400).json({
        success: false,
        message: "Missing contact id (cid) param"
      });
    }

    const apiKey = process.env.GHL_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "Missing GHL_API_KEY env variable"
      });
    }

    const ghlUrl = `https://rest.gohighlevel.com/v1/contacts/${cid}?include=customField`;
    const ghlResponse = await axios.get(ghlUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });

    const contact = ghlResponse.data.contact;
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: `No contact found with id ${cid}`
      });
    }

    const cfArray = contact.customField || [];
    
    // Field IDs from your GHL setup
    const fieldIds = {
      relationships: 'OULJQ8lRkHXwGn1bQbcO',
      finances: 'Me9DoKMePvwhScSBVJwQ',
      selfCare: 'hX8k3EGP30vCfBjKfew2',
      legacyLiving: '2XU9EXN7vxdoR2E00WAO',
      careerBusiness: 'R3abr4tA49scN3pmRvux',
      selfConfidence: 'pNjRh0g9odpYxeUO1V99'
    };

    function getFieldValue(fieldId) {
      const field = cfArray.find(cf => cf.id === fieldId);
      return field ? parseInt(field.value, 10) || 0 : 0;
    }

    const data = {
      relationships: getFieldValue(fieldIds.relationships),
      finances: getFieldValue(fieldIds.finances),
      selfCare: getFieldValue(fieldIds.selfCare),
      legacyLiving: getFieldValue(fieldIds.legacyLiving),
      careerBusiness: getFieldValue(fieldIds.careerBusiness),
      selfConfidence: getFieldValue(fieldIds.selfConfidence)
    };

    // Debug: Log final values
    console.log("Final data being sent:", data);

    res.json({
      success: true,
      data: data
    });

  } catch (err) {
    console.error("Detailed error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.toString()
    });
  }
};
