const axios = require("axios");

module.exports = async function handler(req, res) {
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
    let ghlResponse = await axios.get(ghlUrl, {
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
	
	const contact = ghlResponse.data.contact;
console.log("DEBUG: contact.customField =", contact.customField);

    // Example custom field extraction:
    let cfArray = contact.customField || [];
    function getFieldValue(fieldName) {
      let fieldObj = cfArray.find(cf => cf.name === fieldName);
      if (!fieldObj) return 0;
      return parseInt(fieldObj.fieldValue, 10) || 0;
    }

    let relationshipsRaw  = getFieldValue("relationships");
    let selfConfidenceRaw = getFieldValue("selfconfidence");
    let financesRaw       = getFieldValue("finances");
    // etc. if you have more fields

    res.json({
      success: true,
      data: {
        relationships:  relationshipsRaw,
        selfConfidence: selfConfidenceRaw,
        finances:       financesRaw
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
