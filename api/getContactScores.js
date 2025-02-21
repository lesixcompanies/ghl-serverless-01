const axios = require("axios");

module.exports = async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://wheel.makingofyour.life');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS request for CORS preflight
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

    console.log("DEBUG: contact.customField =", contact.customField);
    
    // Custom field extraction
    const cfArray = contact.customField || [];
    function getFieldValue(fieldName) {
      const fieldObj = cfArray.find(cf => cf.name === fieldName);
      if (!fieldObj) return 0;
      return parseInt(fieldObj.fieldValue, 10) || 0;
    }

    // Get all required field values
    const relationshipsRaw = getFieldValue("relationships");
    const selfConfidenceRaw = getFieldValue("selfconfidence");
    const financesRaw = getFieldValue("finances");
    const selfCareRaw = getFieldValue("selfcare");
    const legacyLivingRaw = getFieldValue("legacyliving");
    const careerBusinessRaw = getFieldValue("careerbusiness");

    res.json({
      success: true,
      data: {
        relationships: relationshipsRaw,
        selfConfidence: selfConfidenceRaw,
        finances: financesRaw,
        selfCare: selfCareRaw,
        legacyLiving: legacyLivingRaw,
        careerBusiness: careerBusinessRaw
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.toString()
    });
  }
};
