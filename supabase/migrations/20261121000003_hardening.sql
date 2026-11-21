-- Ajustes apontados pelos advisors de segurança do Supabase
-- handle_new_user só deve rodar como trigger
revoke execute on function public.handle_new_user() from public, anon, authenticated;
-- search_path fixo
alter function public.touch_updated_at() set search_path = public;
-- função não utilizada pela aplicação
revoke execute on function public.current_role_name() from anon, authenticated;
-- is_admin()/is_staff() permanecem executáveis: são usadas nas policies e só
-- informam o papel do próprio chamador (anon sempre recebe false).
-- submit_lead() é pública por design (formulário), com validação e rate limit.
-- rate_limits: RLS sem policies é intencional (acesso só via funções/servidor).
