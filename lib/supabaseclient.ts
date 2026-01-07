import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://drptaxspqlvzstykhqik.supabase.co'
const supabaseKey = 'sb_publishable_A3nGjQBDB78li5de1FclAw_pg8Dl3SP'

export const supabase = createClient(supabaseUrl, supabaseKey)
