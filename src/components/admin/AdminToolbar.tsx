
import React from 'react';
import { User, Search, Plus, Filter, SortDesc } from 'lucide-react';
import { StaffRole } from '@/types/staff';
import { Input } from '@/components/ui/input';

interface AdminToolbarProps {
  searchTerm: string;
  filterRole: StaffRole | 'All';
  sortBy: 'name' | 'role' | 'score';
  sortAsc: boolean;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: StaffRole | 'All') => void;
  onSortChange: (value: 'name' | 'role' | 'score') => void;
  onSortDirectionChange: () => void;
  onAddStaffClick: () => void;
}

const AdminToolbar: React.FC<AdminToolbarProps> = ({
  searchTerm,
  filterRole,
  sortBy,
  sortAsc,
  onSearchChange,
  onFilterChange,
  onSortChange,
  onSortDirectionChange,
  onAddStaffClick
}) => {
  return (
    <div className="cyber-panel mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyber-cyan/70" />
          <Input
            type="text"
            placeholder="Search staff..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-cyber-black border border-cyber-cyan/50 pl-10 text-white placeholder:text-white/50 focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan"
          />
        </div>
        
        {/* Filter and Sort */}
        <div className="flex space-x-2">
          <div className="flex items-center space-x-2 bg-cyber-black border border-cyber-cyan/50 rounded px-3">
            <Filter size={16} className="text-cyber-cyan/70" />
            <select 
              value={filterRole} 
              onChange={(e) => onFilterChange(e.target.value as StaffRole | 'All')}
              className="bg-transparent text-white border-0 focus:ring-0 py-2"
            >
              <option value="All">All Roles</option>
              <option value="Moderator">Moderators</option>
              <option value="Builder">Builders</option>
              <option value="Manager">Managers</option>
              <option value="Owner">Owners</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2 bg-cyber-black border border-cyber-cyan/50 rounded px-3">
            <SortDesc size={16} className={`text-cyber-cyan/70 transform ${sortAsc ? 'rotate-180' : ''}`} onClick={onSortDirectionChange} />
            <select 
              value={sortBy} 
              onChange={(e) => onSortChange(e.target.value as 'name' | 'role' | 'score')}
              className="bg-transparent text-white border-0 focus:ring-0 py-2"
            >
              <option value="name">Sort by Name</option>
              <option value="role">Sort by Role</option>
              <option value="score">Sort by Score</option>
            </select>
          </div>
        </div>
        
        {/* Add Staff Button */}
        <div className="flex justify-end">
          <button 
            onClick={onAddStaffClick}
            className="cyber-button text-white flex items-center gap-1 px-4 py-2"
          >
            <Plus size={18} />
            Add Staff
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminToolbar;
