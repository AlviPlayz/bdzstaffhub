
import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Copy, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { ApiToken } from '@/services/staff/events/types';
import { createApiToken } from '@/services/staff/events/security';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const ApiTokenManager: React.FC = () => {
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenSource, setNewTokenSource] = useState('');
  const [showToken, setShowToken] = useState<string | null>(null);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchTokens();

    // Set up realtime subscription
    const channel = supabase
      .channel('public:api_tokens')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'api_tokens' 
      }, () => {
        fetchTokens();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('api_tokens')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTokens(data as ApiToken[]);
    } catch (error) {
      console.error('Error fetching API tokens:', error);
      toast({
        title: 'Error',
        description: 'Failed to load API tokens',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateToken = async () => {
    if (!newTokenName.trim() || !newTokenSource.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Token name and source are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const token = await createApiToken(newTokenName, newTokenSource);
      if (token) {
        setNewToken(token);
        toast({
          title: 'Success',
          description: `Created token: ${newTokenName}`,
        });
        setNewTokenName('');
        setNewTokenSource('');
      }
    } catch (error) {
      console.error('Error creating API token:', error);
      toast({
        title: 'Error',
        description: 'Failed to create API token',
        variant: 'destructive'
      });
    }
  };

  const handleToggleTokenStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('api_tokens')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Token ${isActive ? 'disabled' : 'enabled'}`,
      });
    } catch (error) {
      console.error('Error updating token status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update token status',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteToken = async (id: string) => {
    try {
      const { error } = await supabase
        .from('api_tokens')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Token deleted',
      });
    } catch (error) {
      console.error('Error deleting API token:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete token',
        variant: 'destructive'
      });
    }
  };

  const copyTokenToClipboard = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    toast({
      title: 'Copied',
      description: 'Token copied to clipboard',
    });
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  if (loading && tokens.length === 0) {
    return (
      <div className="cyber-panel">
        <h2 className="text-xl font-digital text-white mb-4">API Tokens</h2>
        <div className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-t-2 border-b-2 border-cyber-cyan rounded-full mx-auto mb-4"></div>
          <p className="text-cyber-cyan">Loading API tokens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cyber-panel">
      <h2 className="text-xl font-digital text-white mb-4">API Tokens</h2>
      
      {newToken && (
        <div className="mb-6 bg-cyber-darkpurple border border-cyber-cyan p-4 rounded">
          <h3 className="text-cyber-cyan mb-2 font-digital">New Token Created</h3>
          <p className="text-white text-sm mb-2">
            Make sure to copy your token now. You won't be able to see it again!
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-2 bg-cyber-black/50 text-green-400 rounded overflow-x-auto font-mono">
              {newToken}
            </code>
            <button
              onClick={() => copyTokenToClipboard(newToken)}
              className="cyber-button-sm"
            >
              {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <button
            onClick={() => setNewToken(null)}
            className="mt-4 text-sm text-cyber-cyan hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex items-end gap-4 mb-4">
          <div className="flex-1">
            <label htmlFor="new-token-name" className="block text-sm text-cyber-cyan mb-1">
              Token Name
            </label>
            <input
              id="new-token-name"
              type="text"
              value={newTokenName}
              onChange={(e) => setNewTokenName(e.target.value)}
              placeholder="e.g. Discord Bot"
              className="w-full bg-cyber-black border border-cyber-cyan/40 text-white rounded p-2"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="new-token-source" className="block text-sm text-cyber-cyan mb-1">
              Source
            </label>
            <input
              id="new-token-source"
              type="text"
              value={newTokenSource}
              onChange={(e) => setNewTokenSource(e.target.value)}
              placeholder="e.g. Discord"
              className="w-full bg-cyber-black border border-cyber-cyan/40 text-white rounded p-2"
            />
          </div>
          <div>
            <button 
              onClick={handleCreateToken}
              className="cyber-button-sm flex items-center gap-1"
            >
              <PlusCircle size={16} /> Generate Token
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto pr-2">
        {tokens.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="text-cyber-cyan border-b border-cyber-cyan/30">
              <tr>
                <th className="text-left py-2">Name</th>
                <th className="text-left py-2">Source</th>
                <th className="text-left py-2">Token</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Created</th>
                <th className="text-left py-2">Last Used</th>
                <th className="text-right py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token) => (
                <tr key={token.id} className="border-b border-cyber-cyan/10 hover:bg-cyber-darkpurple">
                  <td className="py-3 text-white">{token.name}</td>
                  <td className="py-3 text-white/70">{token.source}</td>
                  <td className="py-3">
                    <div className="flex items-center">
                      <code className="bg-cyber-black/50 px-2 py-1 rounded text-xs font-mono text-white/70 mr-2">
                        {showToken === token.id ? token.token : '•••••••••••••••'}
                      </code>
                      <button
                        onClick={() => setShowToken(showToken === token.id ? null : token.id)}
                        className="text-cyber-cyan hover:text-white"
                      >
                        {showToken === token.id ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </td>
                  <td className="py-3">
                    <span 
                      className={`inline-block px-2 py-1 rounded text-xs ${
                        token.is_active 
                          ? 'bg-green-900/30 text-green-400' 
                          : 'bg-red-900/30 text-red-400'
                      }`}
                    >
                      {token.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-3 text-white/50 text-xs">
                    {new Date(token.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-white/50 text-xs">
                    {token.last_used_at 
                      ? new Date(token.last_used_at).toLocaleDateString()
                      : 'Never'
                    }
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">
                    <button 
                      onClick={() => handleToggleTokenStatus(token.id, token.is_active)}
                      className={`${
                        token.is_active 
                          ? 'hover:text-red-300 text-red-400' 
                          : 'hover:text-green-300 text-green-400'
                      } p-1`}
                    >
                      {token.is_active ? 'Disable' : 'Enable'}
                    </button>
                    <button 
                      onClick={() => handleDeleteToken(token.id)}
                      className="text-red-400 hover:text-red-300 p-1 ml-2"
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
            <p className="text-cyber-cyan/50">No API tokens created yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiTokenManager;
