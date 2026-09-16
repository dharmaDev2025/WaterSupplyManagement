import Customer from "../models/customer.model.js";

// GET CUSTOMER PROFILE
export const getCustomerProfile = async (req, res) => {
  try {
    const customer = req.customer;

    return res.status(200).json({
      success: true,
      message: "Customer profile fetched successfully",
      customer: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        customerType: customer.customerType,
        address: customer.address,
        location: customer.location,
        authProvider: customer.authProvider,
        isEmailVerified: customer.isEmailVerified,
        isActive: customer.isActive,
        createdAt: customer.createdAt,
      },
    });
  } catch (error) {
    console.error("Get Customer Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch customer profile",
    });
  }
};


// UPDATE CUSTOMER PROFILE
export const updateCustomerProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      customerType,
      address,
    } = req.body;

    const customer = await Customer.findById(
      req.customer._id
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Update only provided fields
    if (name !== undefined) {
      customer.name = name;
    }

    if (phone !== undefined) {
      customer.phone = phone;
    }

    if (customerType !== undefined) {
      customer.customerType = customerType;
    }

    // Update address
    if (address) {
      if (address.houseNo !== undefined) {
        customer.address.houseNo = address.houseNo;
      }

      if (address.street !== undefined) {
        customer.address.street = address.street;
      }

      if (address.city !== undefined) {
        customer.address.city = address.city;
      }
    }

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Customer profile updated successfully",

      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        customerType: customer.customerType,
        address: customer.address,
        location: customer.location,
      },
    });

  } catch (error) {
    console.error("Update Customer Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update customer profile",
    });
  }
};


// UPDATE CUSTOMER LOCATION
export const updateCustomerLocation = async (req, res) => {
  try {
    const {
      latitude,
      longitude,
    } = req.body;

    // Check required values
    if (
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Latitude and longitude are required",
      });
    }

    // Validate range
    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid latitude or longitude",
      });
    }

    const customer = await Customer.findById(
      req.customer._id
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    customer.location.latitude = latitude;
    customer.location.longitude = longitude;

    await customer.save();

    return res.status(200).json({
      success: true,
      message:
        "Customer location updated successfully",

      location: customer.location,
    });

  } catch (error) {
    console.error(
      "Update Customer Location Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update customer location",
    });
  }
};