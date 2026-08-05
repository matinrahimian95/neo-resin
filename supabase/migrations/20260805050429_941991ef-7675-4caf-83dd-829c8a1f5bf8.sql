CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  long_description text NOT NULL DEFAULT '',
  price integer NOT NULL,
  category text NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  image_key text NOT NULL,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  sizes jsonb NOT NULL DEFAULT '[]'::jsonb,
  dimensions_cm jsonb NOT NULL DEFAULT '{}'::jsonb,
  weight_grams integer,
  material text,
  prep_days integer,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are public" ON public.products FOR SELECT USING (true);

CREATE TRIGGER products_set_updated_at BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body text NOT NULL,
  is_approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX product_reviews_product_idx ON public.product_reviews (product_id, created_at DESC);

GRANT SELECT, INSERT ON public.product_reviews TO anon;
GRANT SELECT, INSERT ON public.product_reviews TO authenticated;
GRANT ALL ON public.product_reviews TO service_role;

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved reviews are public" ON public.product_reviews
FOR SELECT USING (is_approved = true);

CREATE POLICY "Anyone can submit a review" ON public.product_reviews
FOR INSERT WITH CHECK (is_approved = false AND char_length(author_name) BETWEEN 2 AND 60 AND char_length(body) BETWEEN 5 AND 1000);

INSERT INTO public.products (slug, title, description, long_description, price, category, stock, image_key, gallery, sizes, dimensions_cm, weight_grams, material, prep_days, features, featured, sort_order) VALUES
('tray-noir','سینی نوآر طلاکوب','سینی رزین دست‌ساز با رگه‌های ورق طلا و دستگیره برنجی، مناسب پذیرایی رسمی.','سینی نوآر با بستر رزین مشکی و رگه‌های ورق طلای دست‌نشان ساخته می‌شود. سطح آن پرداخت آینه‌ای دارد و دستگیره‌های برنجی با پیچ‌های استیل محکم شده‌اند. هر سینی به‌صورت دستی ریخته‌گری می‌شود، بنابراین الگوی رگه‌ها در هیچ دو قطعه‌ای یکسان نیست.',4850000,'trays',6,'tray','["tray","hero","texture","artist"]','[{"label":"کوچک","multiplier":0.8},{"label":"متوسط","multiplier":1},{"label":"بزرگ","multiplier":1.35}]','{"کوچک":"۲۵ × ۱۸","متوسط":"۳۵ × ۲۵","بزرگ":"۴۵ × ۳۰"}',1200,'رزین اپوکسی درجه یک، ورق طلا، دستگیره برنجی',7,'["پرداخت آینه‌ای و مقاوم در برابر خش","ورق طلای دست‌نشان","دستگیره برنجی محکم","مقاوم در برابر رطوبت"]',true,1),
('clock-eclipse','ساعت اکلیپس','ساعت دیواری گرد با بستر مشکی مات و جریان‌های طلایی، موتور بی‌صدا.','ساعت اکلیپس ترکیبی از بستر مشکی مات و جریان‌های طلایی است که در لحظه ریخته‌گری شکل می‌گیرند. موتور ساعت کاملاً بی‌صدا است و پشت آن آویز فلزی نصب شده تا نصب روی دیوار ساده باشد.',6200000,'clocks',4,'clock','["clock","hero","texture","artist"]','[{"label":"کوچک","multiplier":0.8},{"label":"متوسط","multiplier":1},{"label":"بزرگ","multiplier":1.35}]','{"کوچک":"قطر ۳۰","متوسط":"قطر ۴۰","بزرگ":"قطر ۵۰"}',1500,'رزین اپوکسی، رنگ‌دانه دست‌ترکیب، موتور بی‌صدا',10,'["موتور کوارتز بی‌صدا","ایندکس‌های طلایی","آویز فلزی برای نصب آسان","الگوی یکتا در هر قطعه"]',true,2),
('jewel-drop','ست آویز قطره طلا','گردنبند و گوشواره رزین شفاف با پولک‌های طلا و بندهای استیل طلایی.','ست قطره طلا شامل یک گردنبند و یک جفت گوشواره است. بدنه از رزین شفاف با پولک‌های ریز طلا ساخته می‌شود و زنجیر و قلاب‌ها استیل ضدحساسیت با آبکاری طلایی هستند.',1980000,'jewelry',12,'jewelry','["jewelry","hero","texture","artist"]','[{"label":"کوچک","multiplier":0.8},{"label":"متوسط","multiplier":1},{"label":"بزرگ","multiplier":1.35}]','{"کوچک":"قطره ۲","متوسط":"قطره ۳","بزرگ":"قطره ۴"}',35,'رزین شفاف، پولک طلا، استیل ضدحساسیت',5,'["استیل ضدحساسیت","پولک طلای طبیعی","سبک و راحت","جعبه کادویی مخملی"]',true,3),
('acc-coaster','ست زیرلیوانی مرمر شب','چهار زیرلیوانی رزین با لبه‌های طلایی و پایه نمدی.','ست چهارتایی زیرلیوانی با طرح مرمر شب؛ لبه‌ها با ورق طلا پرداخت شده و زیر هر قطعه نمد نرم چسبانده شده تا سطح میز خط نیفتد. مقاوم در برابر حرارت نوشیدنی گرم.',1450000,'accessories',15,'accessories','["accessories","hero","texture","artist"]','[{"label":"کوچک","multiplier":0.8},{"label":"متوسط","multiplier":1},{"label":"بزرگ","multiplier":1.35}]','{"کوچک":"۸ × ۸","متوسط":"۱۰ × ۱۰","بزرگ":"۱۲ × ۱۲"}',400,'رزین اپوکسی، ورق طلا، نمد',5,'["ست چهارتایی","پایه نمدی ضدخش","مقاوم در برابر حرارت","لبه طلاکوب"]',true,4),
('custom-piece','سفارش اختصاصی رزین','طراحی و اجرای اثر سفارشی بر اساس ابعاد، رنگ و ایده شما.','در سفارش اختصاصی، ابعاد، رنگ‌بندی و کاربرد اثر را با هم تعیین می‌کنیم؛ سپس طرح اولیه ارسال می‌شود و پس از تأیید شما ساخت آغاز می‌گردد. قیمت پایه برای ابعاد متوسط است و پس از گفتگو نهایی می‌شود.',7500000,'custom',3,'custom','["custom","hero","texture","artist"]','[{"label":"کوچک","multiplier":0.8},{"label":"متوسط","multiplier":1},{"label":"بزرگ","multiplier":1.35}]','{"کوچک":"تا ۳۰ × ۳۰","متوسط":"تا ۵۰ × ۵۰","بزرگ":"تا ۸۰ × ۸۰"}',2000,'رزین اپوکسی و متریال انتخابی شما',14,'["طرح اولیه پیش از ساخت","انتخاب رنگ و ابعاد","گزارش تصویری مراحل ساخت","بسته‌بندی ویژه"]',false,5),
('tray-petite','سینی کوچک آتلیه','سینی جمع‌وجور برای میز کنسول یا سرو دسر، پرداخت آینه‌ای.','سینی کوچک آتلیه برای میز کنسول، سرو دسر یا نگهداری عطر و جواهر مناسب است. بدنه یکپارچه بدون دستگیره و با لبه‌های نرم اجرا می‌شود.',2650000,'trays',9,'tray','["tray","hero","texture","artist"]','[{"label":"کوچک","multiplier":0.8},{"label":"متوسط","multiplier":1},{"label":"بزرگ","multiplier":1.35}]','{"کوچک":"۱۸ × ۱۲","متوسط":"۲۴ × ۱۶","بزرگ":"۳۰ × ۲۰"}',700,'رزین اپوکسی درجه یک، ورق طلا',6,'["بدنه یکپارچه بدون درز","پرداخت آینه‌ای","لبه‌های نرم","مناسب کنسول و میز آرایش"]',false,6),
('clock-minimal','ساعت مینیمال طلا','طرح ساده با ایندکس‌های طلایی و بستر رزین شب‌رنگ.','ساعت مینیمال با کمترین جزئیات طراحی شده تا در فضاهای مدرن بنشیند. بستر رزین شب‌رنگ با ایندکس‌های طلایی و عقربه‌های باریک ترکیب شده است.',4300000,'clocks',0,'clock','["clock","hero","texture","artist"]','[{"label":"کوچک","multiplier":0.8},{"label":"متوسط","multiplier":1},{"label":"بزرگ","multiplier":1.35}]','{"کوچک":"قطر ۲۵","متوسط":"قطر ۳۵","بزرگ":"قطر ۴۵"}',1100,'رزین اپوکسی، ایندکس فلزی طلایی',8,'["طراحی مینیمال","موتور کوارتز بی‌صدا","عقربه‌های باریک","مناسب فضای مدرن"]',false,7),
('acc-keyring','جاکلیدی رزین طلا','جاکلیدی دست‌ساز با حلقه طلایی و رزین مشکی براق.','جاکلیدی کوچک و سبک با بدنه رزین مشکی براق و رگه طلایی؛ حلقه و زنجیر استیل با آبکاری طلایی. گزینه‌ای مناسب برای هدیه.',620000,'accessories',25,'accessories','["accessories","hero","texture","artist"]','[{"label":"کوچک","multiplier":0.8},{"label":"متوسط","multiplier":1},{"label":"بزرگ","multiplier":1.35}]','{"کوچک":"۴ × ۲","متوسط":"۵ × ۳","بزرگ":"۶ × ۴"}',30,'رزین اپوکسی، حلقه استیل طلایی',3,'["سبک و مقاوم","حلقه استیل طلایی","مناسب هدیه","بسته‌بندی کادویی"]',false,8);