export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: 'customer' | 'representative' | 'admin';
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role?: 'customer' | 'representative' | 'admin';
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'customer' | 'representative' | 'admin';
          name?: string;
          created_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          customer_id: string;
          rep_id: string | null;
          status: 'active' | 'closed' | 'waiting';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          rep_id?: string | null;
          status?: 'active' | 'closed' | 'waiting';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          rep_id?: string | null;
          status?: 'active' | 'closed' | 'waiting';
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          content?: string;
          created_at?: string;
        };
      };
    };
  };
}
