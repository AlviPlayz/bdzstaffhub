
import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Save, AlertCircle } from 'lucide-react';
import { ActionWeight } from '@/services/staff/events/types';
import { getAllActionWeights, upsertActionWeight } from '@/services/staff/events/actionWeights';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const ActionWeightsManager: React.FC = () => {
  const [actionWeights, setActionWeights] = useState<ActionWeight[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAction, setNewAction] = useState('');
  const [newWeight, setNewWeight] = useState<number>(1);
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    fetchActionWeights();

    // Set up realtime subscription
    const channel = supabase
      .channel('public:action_weights')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'action_weights' 
      }, () => {
        fetchActionWeights();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchActionWeights = async () => {
    setLoading(true);
    try {
      const weights = await getAllActionWeights();
      setActionWeights(weights);
    } catch (error) {
      console.error('Error fetching action weights:', error);
      toast({
        title: 'Error',
        description: 'Failed to load action weights',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAction = async () => {
    if (!newAction.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Action name cannot be empty',
        variant: 'destructive'
      });
      return;
    }

    try {
      const result = await upsertActionWeight(newAction, newWeight, newDescription);
      if (result) {
        toast({
          title: 'Success',
          description: `Added action: ${newAction}`,
        });
        setNewAction('');
        setNewWeight(1);
        setNewDescription('');
      }
    } catch (error) {
      console.error('Error adding action weight:', error);
      toast({
        title: 'Error',
        description: 'Failed to add action weight',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateWeight = async (action: string, weight: number, description?: string) => {
    try {
      await upsertActionWeight(action, weight, description);
      toast({
        title: 'Success',
        description: `Updated weight for: ${action}`,
      });
    } catch (error) {
      console.error('Error updating action weight:', error);
      toast({
        title: 'Error',
        description: 'Failed to update action weight',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteAction = async (action: string) => {
    try {
      const { error } = await supabase
        .from('action_weights')
        .delete()
        .eq('action', action);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Deleted action: ${action}`,
      });
    } catch (error) {
      console.error('Error deleting action weight:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete action weight',
        variant: 'destructive'
      });
    }
  };

  if (loading && actionWeights.length === 0) {
    return (
      <div className="cyber-panel">
        <h2 className="text-xl font-digital text-white mb-4">Action Weights</h2>
        <div className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-t-2 border-b-2 border-cyber-cyan rounded-full mx-auto mb-4"></div>
          <p className="text-cyber-cyan">Loading action weights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cyber-panel">
      <h2 className="text-xl font-digital text-white mb-4">Action Weights</h2>
      
      <div className="mb-6">
        <div className="flex items-start gap-2 mb-4">
          <div className="flex-1">
            <label htmlFor="new-action" className="block text-sm text-cyber-cyan mb-1">Action</label>
            <input
              id="new-action"
              type="text"
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
              placeholder="e.g. resolve_ticket"
              className="w-full bg-cyber-black border border-cyber-cyan/40 text-white rounded p-2"
            />
          </div>
          <div>
            <label htmlFor="new-weight" className="block text-sm text-cyber-cyan mb-1">Weight</label>
            <input
              id="new-weight"
              type="number"
              step="0.1"
              min="0"
              value={newWeight}
              onChange={(e) => setNewWeight(parseFloat(e.target.value) || 0)}
              className="w-24 bg-cyber-black border border-cyber-cyan/40 text-white rounded p-2"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="new-description" className="block text-sm text-cyber-cyan mb-1">Description</label>
            <input
              id="new-description"
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="What this action represents"
              className="w-full bg-cyber-black border border-cyber-cyan/40 text-white rounded p-2"
            />
          </div>
          <div className="pt-6">
            <button 
              onClick={handleAddAction}
              className="cyber-button-sm flex items-center gap-1"
            >
              <PlusCircle size={16} /> Add
            </button>
          </div>
        </div>
        
        <div className="bg-cyber-darkpurple/30 border border-cyber-cyan/20 p-3 rounded text-sm">
          <div className="flex items-center gap-2 text-cyber-cyan">
            <AlertCircle size={16} />
            <span>These actions define the weight (points) assigned to each activity type in the system.</span>
          </div>
        </div>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto pr-2">
        {actionWeights.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="text-cyber-cyan border-b border-cyber-cyan/30">
              <tr>
                <th className="text-left py-2">Action</th>
                <th className="text-left py-2">Description</th>
                <th className="text-center py-2">Weight</th>
                <th className="text-right py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {actionWeights.map((weight) => (
                <tr key={weight.id} className="border-b border-cyber-cyan/10 hover:bg-cyber-darkpurple">
                  <td className="py-3 text-white font-mono">{weight.action}</td>
                  <td className="py-3 text-white/70">{weight.description || '-'}</td>
                  <td className="py-3 text-center">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={weight.weight}
                      onChange={(e) => {
                        const newWeight = parseFloat(e.target.value) || 0;
                        setActionWeights(prev => 
                          prev.map(w => w.id === weight.id ? { ...w, weight: newWeight } : w)
                        );
                      }}
                      onBlur={() => handleUpdateWeight(weight.action, weight.weight, weight.description)}
                      className="w-16 bg-cyber-black border border-cyber-cyan/40 text-white rounded p-1 text-center"
                    />
                  </td>
                  <td className="py-3 text-right">
                    <button 
                      onClick={() => handleDeleteAction(weight.action)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8">
            <p className="text-cyber-cyan/50">No actions defined yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionWeightsManager;
