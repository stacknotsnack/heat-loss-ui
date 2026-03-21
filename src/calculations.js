import { supabase } from './supabase';

export async function saveCalculation(name, rooms, result) {
  const { data, error } = await supabase
    .from('calculations')
    .insert({ name, rooms, result })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCalculation(id, name, rooms, result) {
  const { data, error } = await supabase
    .from('calculations')
    .update({ name, rooms, result, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function loadCalculations() {
  const { data, error } = await supabase
    .from('calculations')
    .select('id, name, created_at, updated_at, result')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function loadCalculation(id) {
  const { data, error } = await supabase
    .from('calculations')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCalculation(id) {
  const { error } = await supabase
    .from('calculations')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
