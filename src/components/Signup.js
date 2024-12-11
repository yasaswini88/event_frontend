import React, { useState, useEffect } from "react";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import axios from "axios";

const SignUp = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        gender: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        roles: {
            roleId: null,
            roleName: ""
        }
    });

    const [roles, setRoles] = useState([]);
    const [formErrors, setFormErrors] = useState({});

    const genders = [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
        { label: "Other", value: "other" },
    ];

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await axios.get('/api/roles');
                setRoles(response.data);
            } catch (error) {
                console.error('Error fetching roles:', error);
            }
        };
        fetchRoles();
    }, []);

    const validateForm = () => {
        const errors = {};
        
        if (!formData.firstName) {
            errors.firstName = "First name is required.";
        }
        if (!formData.lastName) {
            errors.lastName = "Last name is required.";
        }
        if (!formData.gender) {
            errors.gender = "Gender is required.";
        }
        if (!formData.email) {
            errors.email = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = "Email is not valid.";
        }
        if (!formData.password) {
            errors.password = "Password is required.";
        } else if (formData.password.length < 6) {
            errors.password = "Password must be at least 6 characters.";
        }
        if (!formData.confirmPassword) {
            errors.confirmPassword = "Confirm password is required.";
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = "Passwords do not match.";
        }
        if (!formData.phoneNumber) {
            errors.phoneNumber = "Phone number is required.";
        } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
            errors.phoneNumber = "Phone number must be 10 digits.";
        }
        if (!formData.roles.roleId) {
            errors.roles = "Role is required.";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        
        if (name === "roles") {
            const selectedRole = roles.find(role => role.roleId === parseInt(value));
            setFormData(prev => ({
                ...prev,
                roles: {
                    roleId: selectedRole.roleId,
                    roleName: selectedRole.roleName
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateForm()) return;
        
        try {
            const userData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                gender: formData.gender,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                password: formData.password,
                roles: formData.roles // Sending complete roles object
            };

            const response = await axios.post('/api/users', userData);
            console.log('User successfully signed up:', response.data);
            alert('Signup successful!');
            
            // Reset form after successful signup
            setFormData({
                firstName: "",
                lastName: "",
                gender: "",
                email: "",
                password: "",
                confirmPassword: "",
                phoneNumber: "",
                roles: {
                    roleId: null,
                    roleName: ""
                }
            });
            setFormErrors({});
        } catch (error) {
            console.error('There was an error submitting the form:', error);
            alert('Signup failed. Please try again.');
        }
    };

    return (
        <div style={{ 
            height: "100vh", 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center",
            backgroundColor: "#e8dede"
        }}>
            <Box sx={{
                width: "80%",
                maxWidth: 900,
                padding: 3,
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                borderRadius: "10px",
                backgroundColor: "white",
            }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <h2 style={{ textAlign: 'center' }}><strong>Sign Up</strong></h2>
                        <form onSubmit={handleSubmit}>
                            <Box sx={{ '& > :not(style)': { m: 1, width: '85%' } }}>
                                <TextField
                                    label="First Name"
                                    variant="filled"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    error={!!formErrors.firstName}
                                    helperText={formErrors.firstName}
                                />
                                <TextField
                                    label="Last Name"
                                    variant="filled"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    error={!!formErrors.lastName}
                                    helperText={formErrors.lastName}
                                />
                                <TextField
                                    select
                                    label="Gender"
                                    variant="filled"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    error={!!formErrors.gender}
                                    helperText={formErrors.gender}
                                >
                                    {genders.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    label="Email"
                                    variant="filled"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    error={!!formErrors.email}
                                    helperText={formErrors.email}
                                />
                                <TextField
                                    label="Password"
                                    variant="filled"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    error={!!formErrors.password}
                                    helperText={formErrors.password}
                                />
                                <TextField
                                    label="Confirm Password"
                                    variant="filled"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    error={!!formErrors.confirmPassword}
                                    helperText={formErrors.confirmPassword}
                                />
                                <TextField
                                    label="Phone Number"
                                    variant="filled"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    error={!!formErrors.phoneNumber}
                                    helperText={formErrors.phoneNumber}
                                />
                                <TextField
                                    select
                                    label="Role"
                                    variant="filled"
                                    name="roles"
                                    value={formData.roles.roleId || ''}
                                    onChange={handleChange}
                                    error={!!formErrors.roles}
                                    helperText={formErrors.roles}
                                >
                                    {roles.map((role) => (
                                        <MenuItem key={role.roleId} value={role.roleId}>
                                            {role.roleName}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                    <Button 
                                        variant="contained" 
                                        color="secondary" 
                                        type="submit"
                                    >
                                        Submit
                                    </Button>
                                </Box>
                            </Box>
                        </form>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Box
                            component="img"
                            src="https://content.jdmagicbox.com/comp/thiruvananthapuram/y3/0471px471.x471.180625215558.t9y3/catalogue/asad-catering-service-and-event-management-thiruvananthapuram-0UNEGGi2sqm9j36.jpg"
                            alt="Event Management"
                            sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "10px",
                            }}
                        />
                    </Grid>
                </Grid>
            </Box>
        </div>
    );
};

export default SignUp;