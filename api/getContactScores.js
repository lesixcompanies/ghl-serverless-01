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

    // Debug: Log the entire custom fields array
    console.log("All custom fields:", contact.customField);

    const cfArray = contact.customField || [];
    
    // Debug: Log each field search
    function getFieldValue(fieldName) {
      console.log(`Searching for field: ${fieldName}`);
      
      // Log all field names to see what's available
      console.log("Available fields:", cfArray.map(cf => cf.name));
      
      const fieldObj = cfArray.find(cf => cf.name.toLowerCase() === fieldName.toLowerCase());
      console.log(`Field object found for ${fieldName}:`, fieldObj);
      
      if (!fieldObj) return 0;
      const value = parseInt(fieldObj.fieldValue, 10) || 0;
      console.log(`Value for ${fieldName}:`, value);
      return value;
    }

    // Try different variations of field names
    const data = {
      selfConfidence: getFieldValue("self confidence") || getFieldValue("selfconfidence") || getFieldValue("self_confidence"),
      finances: getFieldValue("finances") || getFieldValue("finance"),
      careerBusiness: getFieldValue("career / business") || getFieldValue("career__business") || getFieldValue("career_business"),
      relationships: getFieldValue("relationships") || getFieldValue("relationship"),
      selfCare: getFieldValue("self care") || getFieldValue("self_care"),
      legacyLiving: getFieldValue("legacy living") || getFieldValue("legacy_living")
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
