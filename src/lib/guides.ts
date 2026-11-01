import { BUSINESS, POLICY } from "./site";

export type Guide = { intro: string; tips: string[]; faq: { q: string; a: string }[] };

/** Plain, factual buying guidance chosen from the category name. No invented specifications. */
export function categoryGuide(name: string): Guide {
  const n = name.toLowerCase();
  const common = [
    { q: "How do I confirm a board fits my appliance?", a: "Compare the part number and connector layout printed on your old board with the product listing. If you are unsure, send a clear photo of the board on WhatsApp and we will confirm the match before you pay." },
    { q: "Are these boards new or refurbished?", a: "Almost all boards are refurbished and tested before dispatch. Each product page states its condition." },
    { q: "What are the delivery charges and time?", a: `Delivery is ₹${POLICY.shippingCost} through ${POLICY.courier} and takes ${POLICY.transitMinDays} to ${POLICY.transitMaxDays} days across India. Prices are starting prices and the final price is confirmed on WhatsApp at ${BUSINESS.phone}.` },
  ];
  let intro = `This page lists the ${name} boards PCB Care keeps in stock. Each listing shows the brand, model and part number so you can match it to your old board.`;
  let tips = [
    "Read the part number printed on your old board and search for it here.",
    "Match the connector shapes and positions, not only the model name.",
    "Send a photo on WhatsApp if the board has no readable number.",
  ];
  if (n.includes("sensor")) {
    intro = `${name} are temperature sensors (thermistors) used by AC control boards to read room, coil or outdoor temperature. A wrong sensor can trigger error codes or stop the compressor from running correctly.`;
    tips = ["Choose the same resistance rating as the original sensor, for example 10K, 15K, 20K or 50K.", "Match the connector type and the number of sensors on the harness (single, double or triple).", "Check your brand's error code page: many sensor faults show as a specific code."];
  } else if (n.includes("remote")) {
    intro = `${name} here are AC remotes matched to specific brands and models. Remotes from the same brand often differ by model, so matching the exact model matters.`;
    tips = ["Use the model number on your indoor unit or the old remote.", "Use the Find Remote page to see which remote belongs with which board.", "Send a photo of your old remote if the model is unclear."];
  } else if (n.includes("washing")) {
    intro = `${name} are control boards for washing machines. Washing machine boards are matched by brand, number of buttons or display layout, and connector arrangement.`;
    tips = ["Count the buttons or check the display layout of your control panel.", "Check whether your machine is top load or front load, and whether it is an inverter model.", "Match the connector positions on the board before ordering."];
  } else if (n.includes("fridge")) {
    intro = `${name} are control boards for refrigerators. Inverter fridge boards drive a variable-speed compressor, and some models use a separate power board and display board.`;
    tips = ["Check whether your fridge is single door or double door.", "Note the part number printed on the board, as many fridge boards look alike.", "Confirm whether your model is inverter or standard before ordering."];
  } else if (n.includes("microwave")) {
    intro = `${name} are control boards for microwave ovens. They manage the timer, display and the relays that run the oven.`;
    tips = ["Match the model number printed on the old board.", "Check the touch panel or membrane type that connects to the board.", "Send a photo of the board and your oven label on WhatsApp."];
  } else if (n.includes("window")) {
    intro = `${name} are control boards for window air conditioners. Window AC boards combine the display, sensor inputs and compressor and fan control on one board.`;
    tips = ["Match the brand and model of your window AC.", "Check the connector layout for the display and sensors.", "Send a photo of the board for confirmation."];
  } else if (n.includes("outdoor")) {
    intro = `${name} are boards that sit in the outdoor unit of a split AC. They run the compressor and outdoor fan and read the outdoor sensors. Inverter outdoor boards also include the compressor drive stage.`;
    tips = ["Match the brand, tonnage and part number printed on the old board.", "Check whether the unit is inverter or non-inverter.", "Note the motor type (AC or DC) of the outdoor fan where the listing mentions it."];
  } else if (n.includes("indoor")) {
    intro = `${name} are the control boards inside the indoor unit of a split AC. They read the room and coil sensors, drive the indoor fan and swing motor, and signal the outdoor unit.`;
    tips = ["Match the brand and the part number printed on the old board.", "Inverter and non-inverter boards are not interchangeable, so confirm your type.", "Check the motor type (AC or DC indoor fan) where the listing mentions it."];
  }
  return { intro, tips, faq: common };
}
