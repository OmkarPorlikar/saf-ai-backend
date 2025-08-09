import prisma from "../config/prismaClient.mjs";

// GET /api/location-types
export const getAllLocationTypes = async (req, res) => {
  console.log("in get all loc types");
  try {
    const types = await prisma.location_types.findMany({
      where: { company_id: BigInt(2) },
      orderBy: { id: "asc" },
    });

    console.log(types, "types");
    const updatedTypes = types.map((item) => ({
      ...item,
      id: item.id.toString(),
      parent_id: item.parent_id?.toString() || null,
      company_id: item.company_id.toString(),
      //   company_id: BigInt(),
    }));

    res.json(updatedTypes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch location types" });
  }
};

// POST /api/location-types
export const createLocationType = async (req, res) => {
  console.log("in create");
  try {
    const { name, parent_id, is_toilet } = req.body;

    const newType = await prisma.location_types.create({
      data: {
        name,
        parent_id: parent_id ? BigInt(parent_id) : null,
        is_toilet: is_toilet,
        company_id: BigInt(2),
      },
    });

    res.status(201).json({
      ...newType,
      id: newType.id.toString(),
      parent_id: newType.parent_id?.toString() || null,
      company_id: newType.company_id.toString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create location type" });
  }
};

// PATCH /api/location-types/:id
// PATCH /api/location-types/:id
export const updateLocationType = async (req, res) => {
  const { id } = req.params;
  const { name, parent_id } = req.body;

  try {
    const data = {};

    if (name !== undefined) data.name = name;
    if (parent_id !== undefined)
      data.parent_id = parent_id ? BigInt(parent_id) : null;

    const updated = await prisma.location_types.update({
      where: { id: BigInt(id) },
      data,
    });

    res.json({
      ...updated,
      id: updated.id.toString(),
      parent_id: updated.parent_id?.toString() || null,
      company_id: updated.company_id.toString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update location type" });
  }
};


// PATCH /api/location-types/:id/mark-toilet
export const markAsToilet = async (req, res) => {
  const { id } = req.params;

  try {
    const updated = await prisma.location_types.update({
      where: { id: BigInt(id) },
      data: {
        is_toilet: true,
      },
    });

    res.json({
      ...updated,
      id: updated.id.toString(),
      parent_id: updated.parent_id?.toString() || null,
      company_id: updated.company_id.toString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to mark as toilet" });
  }
};

// GET /api/location-types/tree
export const getLocationTypeTree = async (req, res) => {
  try {
    const all = await prisma.location_types.findMany({
      where: { company_id: BigInt(1) },
      orderBy: { id: "asc" },
    });

    const map = {};
    const roots = [];

    all.forEach((t) => {
      const tId = t.id.toString();
      map[tId] = {
        ...t,
        id: tId,
        parent_id: t.parent_id?.toString() || null,
        company_id: t.company_id.toString(),
        children: [],
      };
    });

    all.forEach((t) => {
      const tId = t.id.toString();
      const parentId = t.parent_id?.toString();

      if (parentId && map[parentId]) {
        map[parentId].children.push(map[tId]);
      } else {
        roots.push(map[tId]);
      }
    });

    res.json(roots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch location type tree" });
  }
};
