interface TemplateItem {
  category: string;
  checkItem: string;
  result: string;
  priority: string;
  correctiveAction: string;
  actionParty: string;
  remarks: string;
}

function item(category: string, checkItem: string): TemplateItem {
  return { category, checkItem, result: "PENDING", priority: "", correctiveAction: "", actionParty: "", remarks: "" };
}

const SPILLS = "Spills, Preparedness and Response";
const CONTAINMENT = "Secondary Containment Areas";
const FUEL = "Island / Fuel Area";
const GENERAL = "General Work Areas";
const SAFETY = "Safety";
const FIRST_AID = "First Aid";
const ELECTRICAL = "Electrical Safety";
const TOOLS = "Tools and Equipment";
const CRANES = "Overhead Cranes and Lifting Gear";
const HAZ_CHEM = "Hazardous Chemicals - Work Shops";
const CHEM_STORAGE = "Chemical Storage Areas / Tank Farms";
const WASTE = "Waste Handling and Storage";
const WASH = "Wash Bay / Wash Area";
const PRESSURE = "Pressure Testing Areas";
const SECURITY = "Security Control";
const SIGNAGE = "Signage";
const PARKING = "Parking Areas";
const LANDSCAPING = "Landscaping and Grounds";
const FACILITY = "Facility and Infrastructure";
const ENTRIES = "Entries, Exits, Walkways and Stairs";
const RECEPTION = "Reception and Office Areas";
const FOOD = "Food and Coffee Area";
const LEGAL = "Legal & Government";
const UTILITIES = "Utilities";
const HOUSEKEEPING = "Housekeeping, Sanitation and Hygiene";
const EMERGENCY = "Emergency Operations";
const FIRE = "Fire Protection";
const LOCKER = "Locker Room / Washrooms / Break Areas";
const LAB = "Laboratory";
const QUALITY = "Quality Checklist";

export const HSE_QUALITY_INSPECTION_TEMPLATE: TemplateItem[] = [
  // SPILLS, PREPAREDNESS AND RESPONSE
  item(
    SPILLS,
    "Are emergency response spill kits strategically located? (Load/Unloading, Bulk transfer, Chemical Storage, Fuel Storage, Waste Storage)",
  ),
  item(SPILLS, "Are emergency response spill kits accessible, and adequately stocked?"),
  item(SPILLS, "Is yard free of leaks and spills? (oil, chemicals, solids)"),
  item(
    SPILLS,
    "Is yard free of open containers that could collect water? (buckets, drums, totes, waste/scrap metal bins)",
  ),
  item(SPILLS, "Are storm water discharge points (e.g. outfalls) free of debris and sheen?"),
  item(
    SPILLS,
    "Are truck lines, equipment storage areas and parking areas free of spills, leaks and clean up materials (e.g. absorbents)?",
  ),

  // SECONDARY CONTAINMENT AREAS
  item(CONTAINMENT, "Is secondary containment sized correctly?"),
  item(CONTAINMENT, "Is secondary containment free of chemicals, oils, drilling fluids or other contaminants?"),
  item(CONTAINMENT, "Is secondary containment free of debris (trash, cans, plastic wrap, etc.)?"),
  item(
    CONTAINMENT,
    "Is secondary containment and associated sump(s) free of rainwater or snow accumulation (removed within 24 to 48 hours)?",
  ),
  item(CONTAINMENT, "Are load out connections and flex-transfer hoses capped and stored within secondary containment?"),
  item(CONTAINMENT, "Is the containment free of excess equipment or containers that may reduce its capacity?"),
  item(CONTAINMENT, "Is the secondary containment floor and walls free of cracks, breaks and pipe penetrations?"),
  item(CONTAINMENT, "Are secondary containment drain valves closed and in the locked position and/or pad-locked?"),
  item(CONTAINMENT, "Is there evidence of leaks/spills in the immediate area outside the containment?"),
  item(CONTAINMENT, "Are containment ponds free of debris, sheens or other evidence of contamination?"),

  // ISLAND / FUEL AREA
  item(FUEL, "Are proper barriers in place to protect pumps?"),
  item(FUEL, "Are fuel tanks double walled or in secondary containment?"),
  item(FUEL, "Are pumps, nozzles and hoses in good condition and the area around them clean?"),
  item(FUEL, "Is there a covered, metal waste container present?"),
  item(FUEL, "Are the fuel and oil tanks properly labeled?"),

  // GENERAL WORK AREAS
  item(GENERAL, "Are food and drink prohibited in the work area?"),
  item(GENERAL, "Are emergency eyewash bottles/showers clean, unobstructed, within date, and inspected?"),
  item(GENERAL, "Are material movement and walkway aisles marked and clear?"),
  item(GENERAL, "Are benches and work surfaces free of clutter, safe and in good repair?"),
  item(GENERAL, "Is there sufficient local and general ventilation?"),
  item(GENERAL, "Are noise levels at or below acceptable levels?"),
  item(GENERAL, "Is lighting adequate for the operations being performed?"),
  item(GENERAL, "Is appropriate PPE readily available?"),
  item(GENERAL, "Is PPE clean, well maintained and fit for purpose?"),
  item(GENERAL, "Is appropriate PPE being used?"),
  item(GENERAL, "Are lockout tagout procedures being used?"),
  item(GENERAL, "Are racks and shelves marked with load rating, in good condition and not overloaded?"),
  item(GENERAL, "Is there a hot work area designated?"),
  item(GENERAL, "Is fall protection equipment available and in good condition when working at height?"),
  item(GENERAL, "Are pumps, compressors, generators and engines free of leaks and drip pans empty and clean?"),
  item(GENERAL, "Are drip pans or absorbent pad used to catch fluids during maintenance activities?"),
  item(GENERAL, "Is the work area clean and orderly?"),
  item(GENERAL, "Are there trip hazards in and around work areas?"),
  item(GENERAL, "Are extension cords being used as permanent wiring? Extension cords in good condition?"),
  item(GENERAL, "Is the TFC calibration arrangement at safe distance from other work area?"),
  item(GENERAL, "Are there enough tools racks to meet the workshop requirement?"),
  item(GENERAL, "Are racks secured, bolted down, and on level pavement?"),
  item(GENERAL, "Does the washbay have a holding tank?"),
  item(GENERAL, "Is the holding tank fitted with an operational oil/water separator/treatment unit?"),
  item(GENERAL, "Does the washbay floor have the necessary gradient for water drainage?"),
  item(GENERAL, "Are there arrangements in the washbay to prevent electrical cables from lying on the wet floor?"),
  item(GENERAL, "Is there a defined area for 3rd party inspection with dedicated tools racks of safe design?"),
  item(GENERAL, "Is the compressed air network working and adequate?"),
  item(
    GENERAL,
    "Are there requirements to prohibit employees from using compressed air for cleaning unless the pressure is reduced to less than 30 psi?",
  ),
  item(GENERAL, "Are compressed air cylinders visually inspected?"),
  item(GENERAL, "Are compressed air receivers equipped with an indicating pressure gauge?"),
  item(GENERAL, "Are compressed air safety valves tested?"),
  item(GENERAL, "Are compressed air receivers frequently drained?"),
  item(GENERAL, "Are there air conditioning, heating, humidity control systems in place and operational as necessary?"),
  item(GENERAL, "Have the AC, heating and humidity control systems serviced per maintenance schedule?"),
  item(GENERAL, "Is the facility handicapped accessible?"),
  item(GENERAL, "Have the facility and infrastructure needs been planned to accommodate the foreseeable demand/work?"),
  item(GENERAL, "Are there dedicated employee break areas?"),
  item(GENERAL, "Does the facility have arrangements/contracts for facility cleaning (e.g. sweeping, mopping etc.)?"),
  item(GENERAL, "Are there sufficient ports for network connectivity within the facility?"),
  item(GENERAL, "Are the electrical and emergency lighting drawings for the facility current and available?"),
  item(GENERAL, "Has the emergency lighting been tested as per schedule?"),
  item(GENERAL, "Are the different types of drains in the facility identified and marked as necessary?"),
  item(GENERAL, "Are there arrangements made for pest control at the facility?"),
  item(GENERAL, "Is there a dedicated fully functional Lithium Battery storage space at the facility?"),

  // SAFETY
  item(
    SAFETY,
    "Are the necessary alarms and signage operational and visible in the correct location around the calibration unit?",
  ),
  item(SAFETY, "Have the racks been tested per manufacturer/fabricator recommendations?"),
  item(SAFETY, "Is the compressor located at a safe distance away from flammable materials?"),
  item(SAFETY, "Are there dedicated and certified cabinets for chemicals?"),
  item(SAFETY, "Are all PPE equipments available near the chemical cabinets?"),
  item(SAFETY, "Does the facility have emergency shower arrangements as necessary?"),
  item(SAFETY, "Is there a facility security plan?"),
  item(SAFETY, "Is the emergency response plan placed at several necessary locations around the facility?"),
  item(SAFETY, "Are all safety alarms related to Lithium Batteries functional and tested periodically?"),

  // FIRST AID
  item(FIRST_AID, "Are first aid supplies easily accessible and within current inspection?"),
  item(FIRST_AID, "Are first aiders identified and able to be quickly contacted?"),
  item(FIRST_AID, "Are bloodborne pathogen kits available?"),

  // ELECTRICAL SAFETY
  item(ELECTRICAL, "Are electrical cords routed away from possible hazards?"),
  item(ELECTRICAL, "Are junction boxes closed and accessible?"),
  item(ELECTRICAL, "Are breakers and switchgear properly labeled, kept free of obstruction and flammable material?"),
  item(ELECTRICAL, "Are electrical appliances, cables and plugs in good condition?"),
  item(ELECTRICAL, "Are high voltage rooms and other high hazard areas marked and restricted?"),

  // TOOLS AND EQUIPMENT
  item(TOOLS, "Are tools and equipment stored properly?"),
  item(TOOLS, "Are tools free of damage and in proper working order? (no homemade tools or locally altered tools)"),
  item(TOOLS, "Are moving/rotating parts properly guarded?"),
  item(TOOLS, "Are guards in good condition and being used?"),
  item(TOOLS, "Are cutting machines kept clear of cuttings/debris/dust?"),
  item(TOOLS, "Are cables and hoses away from where they may be damaged?"),
  item(TOOLS, "Is mobile equipment stored properly when not in use?"),
  item(TOOLS, "Are parts storage areas secure, labeled and kept orderly?"),
  item(TOOLS, "Are hand tools in good condition?"),
  item(TOOLS, "Do torque machines have a maintenance checklist and are they serviced per the schedule?"),
  item(TOOLS, "Do hydro vices have a maintenance checklist and are they serviced per the schedule?"),
  item(TOOLS, "Do forklift/side loaders have a maintenance checklist and are they serviced per the schedule?"),
  item(TOOLS, "Does the air compressor have a maintenance checklist and is it serviced per the schedule?"),
  item(TOOLS, "Do ovens used for heat testing have a maintenance checklist and are they serviced per the schedule?"),
  item(TOOLS, "As applicable, are work benches and surrounding areas ESD certified?"),
  item(TOOLS, "Do the ESD equipments have updated calibration/testing certificates?"),
  item(TOOLS, "Is the necessary signage around the ESD area posted and visible?"),
  item(TOOLS, "Are tool trolleys certified and have labeled with the load carrying capacity?"),
  item(TOOLS, "Have the trolleys been inspected per maintenance schedule?"),
  item(TOOLS, "Does the backup generator have a maintenance checklist and is it serviced per the schedule?"),

  // OVERHEAD CRANES AND LIFTING GEAR
  item(CRANES, "Do overhead cranes have a maintenance checklist and are they serviced per the schedule?"),
  item(CRANES, "Are control pendants in good condition with controls clearly marked?"),
  item(CRANES, "Is the Safe Working Load (SWL) clearly marked?"),
  item(CRANES, "Do limit switches and emergency stops function properly?"),
  item(CRANES, "Are the brakes effective?"),
  item(CRANES, "Is the safety catch on the hook present and functional?"),
  item(CRANES, "Can all lifts be made vertically?"),
  item(CRANES, "Is the lifting gear inspected and properly tagged?"),
  item(CRANES, "Have cranes been inspected?"),
  item(CRANES, "Are chains and slings in good condition?"),

  // HAZARDOUS CHEMICALS - WORK SHOPS
  item(HAZ_CHEM, "Is there suitable localized ventilation of vapors and fumes?"),
  item(HAZ_CHEM, "Are flammable materials stored and labeled properly?"),
  item(HAZ_CHEM, "Are the sizes of containers suitable for the application?"),
  item(HAZ_CHEM, "Are gas cylinders secured?"),
  item(HAZ_CHEM, "Are COSHH assessments readily available where required?"),

  // CHEMICAL STORAGE AREAS / TANK FARMS
  item(CHEM_STORAGE, "Are tanks, drums, totes clearly labeled?"),
  item(CHEM_STORAGE, "Are tank vents, pressure relief valves and roof hatches in good working condition?"),
  item(
    CHEM_STORAGE,
    "Are sight glasses, direct vision gauges or other volume level indicators in good working condition?",
  ),
  item(
    CHEM_STORAGE,
    "Are tank(s) including mixing tanks and associated equipment in good condition and free from leaks?",
  ),
  item(CHEM_STORAGE, "Are gates, walkways, railings and ladders maintained and inspected?"),
  item(CHEM_STORAGE, "Are sumps empty, clean and isolated?"),
  item(CHEM_STORAGE, "Are empty containers being handled and stored properly?"),
  item(CHEM_STORAGE, "Are air emission control devices working properly?"),
  item(CHEM_STORAGE, "Are pumps, piping, hoses and connections in good condition, tight and secure?"),
  item(CHEM_STORAGE, "Are pipes not in service capped and marked 'out of service'?"),
  item(CHEM_STORAGE, "Is the area free of chemical residue?"),
  item(CHEM_STORAGE, "Are valves closed and secure?"),
  item(CHEM_STORAGE, "Are appropriate pumps and funnels available for transferring fluids?"),
  item(CHEM_STORAGE, "Are bonding cables available for use when transferring flammable and combustible liquids?"),
  item(CHEM_STORAGE, "Are camlock straps or similar locking devices available for use during transfers?"),
  item(CHEM_STORAGE, "Are caps installed on open ended valves, hoses and lines?"),
  item(CHEM_STORAGE, "Are manifold lines clearly labeled?"),
  item(CHEM_STORAGE, "Are emergency shut-offs prominently labeled, accessible and working?"),

  // WASTE HANDLING AND STORAGE
  item(WASTE, "Is there a designated waste storage area?"),
  item(WASTE, "Are wastes properly labeled?"),
  item(WASTE, "Are wastes being properly disposed?"),
  item(WASTE, "Is there an excess accumulation of pallets and empty drums?"),

  // WASH BAY / WASH AREA
  item(WASH, "Are sumps and oil/water separators clean and maintained?"),
  item(WASH, "Is wash water contained in the wash bay/wash area?"),
  item(WASH, "Are washing equipment and wands in good condition?"),

  // PRESSURE TESTING AREAS
  item(PRESSURE, "Are pressure testing enclosures approved enclosures?"),
  item(PRESSURE, "Are warning lights/signs sufficient, working and used?"),
  item(PRESSURE, "Is maximum acceptable working pressure of testing system indicated?"),
  item(PRESSURE, "Are controls and valves in a secure area, inspected and tested?"),
  item(PRESSURE, "Are risk assessments and test procedures available, read and understood?"),

  // SECURITY CONTROL
  item(SECURITY, "Is public access to the facility controlled?"),
  item(SECURITY, "Does the perimeter fence prevent unauthorized entry?"),
  item(SECURITY, "Is security lighting in place and functioning?"),
  item(SECURITY, "Is surveillance equipment in place and functioning?"),

  // SIGNAGE
  item(SIGNAGE, "Are signs posted in the local language and English?"),
  item(SIGNAGE, "Are signs legible and in good condition?"),
  item(SIGNAGE, "Is there proper signage giving visitors and vendors directions?"),
  item(SIGNAGE, "Is safety signage sufficient and covers all hazards at the facility?"),
  item(SIGNAGE, "Is proper signage present at the main gate entrance?"),

  // PARKING AREAS
  item(PARKING, "Are traffic direction and speed limit signs posted?"),
  item(PARKING, "Is employee parking area adequately sized, lighted and separate from operational areas?"),
  item(PARKING, "Are provisions made for emergency vehicle access to the property and auxiliary buildings?"),
  item(PARKING, "Does the facility have adequate and safe truck access?"),

  // LANDSCAPING AND GROUNDS
  item(LANDSCAPING, "Are green areas well maintained?"),
  item(LANDSCAPING, "Is proper drainage in place and free of debris?"),
  item(LANDSCAPING, "Are trees and shrubs clear of overhead wires?"),
  item(LANDSCAPING, "Is outdoor lighting switched off during the day?"),

  // FACILITY AND INFRASTRUCTURE
  item(
    FACILITY,
    "For future facility and infrastructure expansion growth, are plans in place to anticipate future needs as they arise?",
  ),
  item(FACILITY, "Is there sufficient work space and storage for chemicals, oils, hazardous materials?"),

  // ENTRIES, EXITS, WALKWAYS AND STAIRS
  item(ENTRIES, "Are buildings free of leaks and other visible defects or damage?"),
  item(ENTRIES, "Are all exterior doors and windows lockable and in good condition?"),
  item(ENTRIES, "Are emergency exits clearly marked and free of obstructions?"),
  item(ENTRIES, "Are exit routes equipped with emergency lighting?"),
  item(ENTRIES, "Are stairways slip resistant, equipped with railings and adequately lit?"),
  item(ENTRIES, "Are there sufficient guards/barriers around stairs, pits, mezzanines and other hazardous areas?"),
  item(ENTRIES, "Are outdoor walkways marked, lighted, in good repair and free of obstructions?"),
  item(ENTRIES, "Are outdoor access ramps available for use and in good repair?"),

  // RECEPTION AND OFFICE AREAS
  item(RECEPTION, "Are visitors issued a badge and required to sign in and out?"),
  item(RECEPTION, "Do visitors and contractors receive a facility orientation including emergency procedures?"),
  item(RECEPTION, "Are workstations and offices free of personal appliances?"),
  item(RECEPTION, "Are suitable step stools / ladders provided to reach objects at height?"),
  item(
    RECEPTION,
    "Are filing cabinets and shelves in working order, anchored if needed, used properly and arranged in a safe manner?",
  ),
  item(
    RECEPTION,
    "Are items properly stored and secured (i.e. no items on top of cabinets, stored above head height, too heavy for shelves, etc.)?",
  ),
  item(RECEPTION, "Is office equipment turned off when the office is not occupied?"),
  item(RECEPTION, "Are all office and cleaning chemicals properly stored?"),
  item(RECEPTION, "Is office area free of open flames (candles, incense burners, etc.)?"),

  // FOOD AND COFFEE AREA
  item(FOOD, "Are break and food preparation areas clean and sanitary?"),
  item(FOOD, "Are utensils, cups and dishes clean and properly stored?"),
  item(FOOD, "Are refrigerators clean, free of spoiled food and drink?"),
  item(FOOD, "Is drinking water marked and readily available?"),

  // LEGAL & GOVERNMENT
  item(
    LEGAL,
    "Does the facility have the necessary permits (e.g. hot work, working at heights etc.) archived and updated?",
  ),
  item(LEGAL, "Are the necessary lease records available?"),
  item(LEGAL, "Are the taxes records available?"),
  item(LEGAL, "Are regulatory inspections and visits documented?"),
  item(LEGAL, "Are there bulletin boards around the facility displaying relevant current information?"),

  // UTILITIES
  item(UTILITIES, "Are emergency alarms tested, maintained and within current inspection?"),
  item(UTILITIES, "Are drainage, separation and sewage systems functioning properly?"),
  item(UTILITIES, "Are lines, piping and conduit labeled for identification of content and hazard?"),
  item(UTILITIES, "Are high hazard areas properly identified and/or limited access?"),

  // HOUSEKEEPING, SANITATION AND HYGIENE
  item(HOUSEKEEPING, "Are objects stacked or stored so they do not present a falling object hazard?"),
  item(HOUSEKEEPING, "Are rubbish / waste / recycle bins segregated, labeled, and emptied regularly?"),
  item(
    HOUSEKEEPING,
    "Are toilets / restrooms clean and sanitary including an adequate supply of toilet paper, hand towels/driers and soap?",
  ),

  // EMERGENCY OPERATIONS
  item(EMERGENCY, "Is an Emergency Operations Plan complete and readily available?"),
  item(EMERGENCY, "Are emergency evacuation routes and muster points posted?"),
  item(EMERGENCY, "Does the facility have the minimum number of muster stations as deemed necessary?"),
  item(EMERGENCY, "Are shelter in place locations clearly identified?"),

  // FIRE PROTECTION
  item(
    FIRE,
    "Are fire extinguishers of the correct type available, marked, mounted, accessible, charged and within current inspection?",
  ),
  item(FIRE, "Are designated smoking areas clearly marked?"),
  item(FIRE, "Are cigarette butt receptacles located at all designated smoking areas?"),
  item(FIRE, "Are all fire fighting equipments placed at necessary locations?"),
  item(FIRE, "Has the fire fighting equipment been tested and marked per maintenance schedule?"),
  item(FIRE, "Is there a fire fighting plan indicating equipment locations and other details?"),
  item(FIRE, "Are the fire fighting plans located at the appropriate locations within the facility?"),
  item(FIRE, "Have the fire drills been carried out as realistically as possible per schedule?"),
  item(FIRE, "Are sprinkler heads free of obstruction?"),
  item(FIRE, "Is the excessive storage of combustibles avoided?"),

  // LOCKER ROOM / WASHROOMS / BREAK AREAS
  item(LOCKER, "Are showers and sinks adequate, clean and maintained?"),
  item(LOCKER, "Are lockers of sufficient size, number and lockable?"),
  item(LOCKER, "Is there sufficient personal storage and changing space, it is clean and maintained?"),

  // LABORATORY
  item(LAB, "Are hoods installed, operable, maintained and inspected?"),
  item(LAB, "Are chemical containers and samples stored and labeled properly?"),

  // QUALITY CHECKLIST
  item(QUALITY, "Quality Policy Statement posted in office and warehouse areas"),
  item(QUALITY, "Elastomers – Verify cure dates/batch numbers/proper packaging"),
  item(QUALITY, "Status identification throughout all stages of process"),
  item(QUALITY, "CRA material clearly marked, packaged and stored"),
  item(QUALITY, "Thread protection on all external threads once inspected by NDE inspection co."),
  item(QUALITY, "Verify all documents used are of the latest rev. and are available at points of use"),
  item(QUALITY, "District Workbooks are complete / All signature lines signed"),
  item(QUALITY, "Randomly have Warehouseman go online and retrieve their Tech Units, etc."),
  item(QUALITY, "Calibrated instruments are serialized and not past due for calibration"),
  item(QUALITY, "Traceability information such as w/o and/or batch numbers are recorded on the Redress Sheets"),
  item(QUALITY, "Verify that Redress Training books are up to date"),
  item(QUALITY, "Customer property properly labeled and stored"),
];
