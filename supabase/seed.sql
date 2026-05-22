-- ============================================================
-- SEED: Fase de Grupos – Copa do Mundo FIFA 2026
-- Todos os horários estão no fuso de Brasília (UTC-3).
-- O sufixo -03 informa o Postgres do offset; ele armazena
-- como UTC internamente e exibe corretamente no fuso local.
-- Execute APÓS rodar schema.sql
-- ============================================================

insert into public.matches (home_team, away_team, match_date, round, group_name) values

-- ============================================================
-- 1ª RODADA
-- ============================================================

-- Quinta-feira, 11 jun 2026
('México',              'África do Sul',               '2026-06-11 16:00:00-03', '1ª Rodada', 'A'),
('República da Coreia', 'República Tcheca',             '2026-06-11 23:00:00-03', '1ª Rodada', 'A'),

-- Sexta-feira, 12 jun 2026
('Canadá',              'Bósnia e Herzegovina',         '2026-06-12 16:00:00-03', '1ª Rodada', 'B'),
('Estados Unidos',      'Paraguai',                    '2026-06-12 22:00:00-03', '1ª Rodada', 'D'),

-- Sábado, 13 jun 2026
('Catar',               'Suíça',                       '2026-06-13 16:00:00-03', '1ª Rodada', 'B'),
('Brasil',              'Marrocos',                    '2026-06-13 19:00:00-03', '1ª Rodada', 'C'),
('Haiti',               'Escócia',                     '2026-06-13 22:00:00-03', '1ª Rodada', 'C'),
('Austrália',           'Turquia',                     '2026-06-14 01:00:00-03', '1ª Rodada', 'D'),

-- Domingo, 14 jun 2026
('Alemanha',            'Curaçau',                     '2026-06-14 14:00:00-03', '1ª Rodada', 'E'),
('Holanda',             'Japão',                       '2026-06-14 17:00:00-03', '1ª Rodada', 'F'),
('Costa do Marfim',     'Equador',                     '2026-06-14 20:00:00-03', '1ª Rodada', 'E'),
('Suécia',              'Tunísia',                     '2026-06-14 23:00:00-03', '1ª Rodada', 'F'),

-- Segunda-feira, 15 jun 2026
('Espanha',             'Cabo Verde',                  '2026-06-15 13:00:00-03', '1ª Rodada', 'H'),
('Bélgica',             'Egito',                       '2026-06-15 16:00:00-03', '1ª Rodada', 'G'),
('Arábia Saudita',      'Uruguai',                     '2026-06-15 19:00:00-03', '1ª Rodada', 'H'),
('Irã',                 'Nova Zelândia',               '2026-06-15 22:00:00-03', '1ª Rodada', 'G'),

-- Terça-feira, 16 jun 2026
('França',              'Senegal',                     '2026-06-16 16:00:00-03', '1ª Rodada', 'I'),
('Iraque',              'Noruega',                     '2026-06-16 19:00:00-03', '1ª Rodada', 'I'),
('Argentina',           'Argélia',                     '2026-06-16 22:00:00-03', '1ª Rodada', 'J'),
('Áustria',             'Jordânia',                    '2026-06-17 01:00:00-03', '1ª Rodada', 'J'),

-- Quarta-feira, 17 jun 2026
('Portugal',            'Rep. Democrática do Congo',   '2026-06-17 14:00:00-03', '1ª Rodada', 'K'),
('Inglaterra',          'Croácia',                     '2026-06-17 17:00:00-03', '1ª Rodada', 'L'),
('Gana',                'Panamá',                      '2026-06-17 20:00:00-03', '1ª Rodada', 'L'),
('Uzbequistão',         'Colômbia',                    '2026-06-17 21:00:00-03', '1ª Rodada', 'K'),

-- ============================================================
-- 2ª RODADA
-- ============================================================

-- Quinta-feira, 18 jun 2026
('República Tcheca',    'África do Sul',               '2026-06-18 13:00:00-03', '2ª Rodada', 'A'),
('Suíça',               'Bósnia e Herzegovina',         '2026-06-18 16:00:00-03', '2ª Rodada', 'B'),
('Canadá',              'Catar',                       '2026-06-18 19:00:00-03', '2ª Rodada', 'B'),
('México',              'República da Coreia',          '2026-06-18 22:00:00-03', '2ª Rodada', 'A'),

-- Sexta-feira, 19 jun 2026
('Estados Unidos',      'Austrália',                   '2026-06-19 16:00:00-03', '2ª Rodada', 'D'),
('Escócia',             'Marrocos',                    '2026-06-19 19:00:00-03', '2ª Rodada', 'C'),
('Brasil',              'Haiti',                       '2026-06-19 21:30:00-03', '2ª Rodada', 'C'),
('Turquia',             'Paraguai',                    '2026-06-20 00:00:00-03', '2ª Rodada', 'D'),

-- Sábado, 20 jun 2026
('Holanda',             'Suécia',                      '2026-06-20 14:00:00-03', '2ª Rodada', 'F'),
('Alemanha',            'Costa do Marfim',              '2026-06-20 17:00:00-03', '2ª Rodada', 'E'),
('Equador',             'Curaçau',                     '2026-06-20 21:00:00-03', '2ª Rodada', 'E'),
('Tunísia',             'Japão',                       '2026-06-20 23:00:00-03', '2ª Rodada', 'F'),

-- Domingo, 21 jun 2026
('Espanha',             'Arábia Saudita',              '2026-06-21 13:00:00-03', '2ª Rodada', 'H'),
('Bélgica',             'Irã',                         '2026-06-21 16:00:00-03', '2ª Rodada', 'G'),
('Uruguai',             'Cabo Verde',                  '2026-06-21 19:00:00-03', '2ª Rodada', 'H'),
('Nova Zelândia',       'Egito',                       '2026-06-21 22:00:00-03', '2ª Rodada', 'G'),

-- Segunda-feira, 22 jun 2026
('Argentina',           'Áustria',                     '2026-06-22 14:00:00-03', '2ª Rodada', 'J'),
('França',              'Iraque',                      '2026-06-22 18:00:00-03', '2ª Rodada', 'I'),
('Noruega',             'Senegal',                     '2026-06-22 21:00:00-03', '2ª Rodada', 'I'),
('Jordânia',            'Argélia',                     '2026-06-23 00:00:00-03', '2ª Rodada', 'J'),

-- Terça-feira, 23 jun 2026
('Portugal',            'Uzbequistão',                 '2026-06-23 14:00:00-03', '2ª Rodada', 'K'),
('Inglaterra',          'Gana',                        '2026-06-23 17:00:00-03', '2ª Rodada', 'L'),
('Panamá',              'Croácia',                     '2026-06-23 20:00:00-03', '2ª Rodada', 'L'),
('Colômbia',            'Rep. Democrática do Congo',   '2026-06-23 23:00:00-03', '2ª Rodada', 'K'),

-- ============================================================
-- 3ª RODADA  (jogos simultâneos dentro de cada grupo)
-- ============================================================

-- Quarta-feira, 24 jun 2026
('Suíça',               'Canadá',                      '2026-06-24 16:00:00-03', '3ª Rodada', 'B'),
('Bósnia e Herzegovina','Catar',                       '2026-06-24 16:00:00-03', '3ª Rodada', 'B'),
('Escócia',             'Brasil',                      '2026-06-24 19:00:00-03', '3ª Rodada', 'C'),
('Marrocos',            'Haiti',                       '2026-06-24 19:00:00-03', '3ª Rodada', 'C'),
('República Tcheca',    'México',                      '2026-06-24 22:00:00-03', '3ª Rodada', 'A'),
('África do Sul',       'República da Coreia',          '2026-06-24 22:00:00-03', '3ª Rodada', 'A'),

-- Quinta-feira, 25 jun 2026
('Equador',             'Alemanha',                    '2026-06-25 17:00:00-03', '3ª Rodada', 'E'),
('Curaçau',             'Costa do Marfim',              '2026-06-25 17:00:00-03', '3ª Rodada', 'E'),
('Japão',               'Suécia',                      '2026-06-25 20:00:00-03', '3ª Rodada', 'F'),
('Tunísia',             'Holanda',                     '2026-06-25 20:00:00-03', '3ª Rodada', 'F'),
('Turquia',             'Estados Unidos',               '2026-06-25 23:00:00-03', '3ª Rodada', 'D'),
('Paraguai',            'Austrália',                   '2026-06-25 23:00:00-03', '3ª Rodada', 'D'),

-- Sexta-feira, 26 jun 2026
('Noruega',             'França',                      '2026-06-26 16:00:00-03', '3ª Rodada', 'I'),
('Senegal',             'Iraque',                      '2026-06-26 16:00:00-03', '3ª Rodada', 'I'),
('Cabo Verde',          'Arábia Saudita',              '2026-06-26 21:00:00-03', '3ª Rodada', 'H'),
('Uruguai',             'Espanha',                     '2026-06-26 21:00:00-03', '3ª Rodada', 'H'),
('Egito',               'Irã',                         '2026-06-27 00:00:00-03', '3ª Rodada', 'G'),
('Nova Zelândia',       'Bélgica',                     '2026-06-27 00:00:00-03', '3ª Rodada', 'G'),

-- Sábado, 27 jun 2026
('Panamá',              'Inglaterra',                  '2026-06-27 18:00:00-03', '3ª Rodada', 'L'),
('Croácia',             'Gana',                        '2026-06-27 18:00:00-03', '3ª Rodada', 'L'),
('Colômbia',            'Portugal',                    '2026-06-27 20:30:00-03', '3ª Rodada', 'K'),
('Rep. Democrática do Congo','Uzbequistão',            '2026-06-27 20:30:00-03', '3ª Rodada', 'K'),
('Argélia',             'Áustria',                     '2026-06-27 23:00:00-03', '3ª Rodada', 'J'),
('Jordânia',            'Argentina',                   '2026-06-27 23:00:00-03', '3ª Rodada', 'J');
