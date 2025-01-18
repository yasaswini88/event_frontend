// RoleSelectionDialog.js
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions,
         Button, FormControl, RadioGroup, FormControlLabel, Radio } from '@mui/material';

const RoleSelectionDialog = ({ open, onClose, roles, onRoleSelect }) => {
  const [selectedRoleId, setSelectedRoleId] = useState(null);

  const handleConfirm = () => {
    if (selectedRoleId) {
      onRoleSelect(selectedRoleId);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Select Your Role</DialogTitle>
      <DialogContent>
        <FormControl>
          <RadioGroup
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
          >
            {roles.map((role) => (
              <FormControlLabel
                key={role.roleId}
                value={role.roleId.toString()}
                control={<Radio />}
                label={role.roleName}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleConfirm} disabled={!selectedRoleId}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleSelectionDialog;
