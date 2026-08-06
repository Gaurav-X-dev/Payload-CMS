import * as migration_20260730_054932_ghee_schema_sync from './20260730_054932_ghee_schema_sync';
import * as migration_20260803_054620_ghee_brand_features_nav_order from './20260803_054620_ghee_brand_features_nav_order';
import * as migration_20260803_063825_ghee_brand_feature_svg_icons from './20260803_063825_ghee_brand_feature_svg_icons';
import * as migration_20260803_142729_ghee_page_contract from './20260803_142729_ghee_page_contract';
import * as migration_20260803_163357_globals_versioning from './20260803_163357_globals_versioning';
import * as migration_20260803_212125_native_page_status_stage_a from './20260803_212125_native_page_status_stage_a';
import * as migration_20260804_062029_ghee_contact_page_experience from './20260804_062029_ghee_contact_page_experience';
import * as migration_20260805_064839_curious_ladoo_tenant_theme from './20260805_064839_curious_ladoo_tenant_theme';
import * as migration_20260805_084729_curious_ladoo_home_blocks from './20260805_084729_curious_ladoo_home_blocks';
import * as migration_20260805_105546_curious_ladoo_about_story_layout from './20260805_105546_curious_ladoo_about_story_layout';
import * as migration_20260805_160441_curious_ladoo_services from './20260805_160441_curious_ladoo_services';
import * as migration_20260806_051406_curious_ladoo_brands from './20260806_051406_curious_ladoo_brands';
import * as migration_20260806_060607_curious_ladoo_portfolio from './20260806_060607_curious_ladoo_portfolio';
import * as migration_20260806_070027_curious_ladoo_how_we_work from './20260806_070027_curious_ladoo_how_we_work';
import * as migration_20260806_084335_curious_ladoo_testimonials from './20260806_084335_curious_ladoo_testimonials';
import * as migration_20260806_094912_curious_ladoo_careers from './20260806_094912_curious_ladoo_careers';

export const migrations = [
  {
    up: migration_20260730_054932_ghee_schema_sync.up,
    down: migration_20260730_054932_ghee_schema_sync.down,
    name: '20260730_054932_ghee_schema_sync',
  },
  {
    up: migration_20260803_054620_ghee_brand_features_nav_order.up,
    down: migration_20260803_054620_ghee_brand_features_nav_order.down,
    name: '20260803_054620_ghee_brand_features_nav_order',
  },
  {
    up: migration_20260803_063825_ghee_brand_feature_svg_icons.up,
    down: migration_20260803_063825_ghee_brand_feature_svg_icons.down,
    name: '20260803_063825_ghee_brand_feature_svg_icons',
  },
  {
    up: migration_20260803_142729_ghee_page_contract.up,
    down: migration_20260803_142729_ghee_page_contract.down,
    name: '20260803_142729_ghee_page_contract',
  },
  {
    up: migration_20260803_163357_globals_versioning.up,
    down: migration_20260803_163357_globals_versioning.down,
    name: '20260803_163357_globals_versioning',
  },
  {
    up: migration_20260803_212125_native_page_status_stage_a.up,
    down: migration_20260803_212125_native_page_status_stage_a.down,
    name: '20260803_212125_native_page_status_stage_a',
  },
  {
    up: migration_20260804_062029_ghee_contact_page_experience.up,
    down: migration_20260804_062029_ghee_contact_page_experience.down,
    name: '20260804_062029_ghee_contact_page_experience',
  },
  {
    up: migration_20260805_064839_curious_ladoo_tenant_theme.up,
    down: migration_20260805_064839_curious_ladoo_tenant_theme.down,
    name: '20260805_064839_curious_ladoo_tenant_theme',
  },
  {
    up: migration_20260805_084729_curious_ladoo_home_blocks.up,
    down: migration_20260805_084729_curious_ladoo_home_blocks.down,
    name: '20260805_084729_curious_ladoo_home_blocks',
  },
  {
    up: migration_20260805_105546_curious_ladoo_about_story_layout.up,
    down: migration_20260805_105546_curious_ladoo_about_story_layout.down,
    name: '20260805_105546_curious_ladoo_about_story_layout',
  },
  {
    up: migration_20260805_160441_curious_ladoo_services.up,
    down: migration_20260805_160441_curious_ladoo_services.down,
    name: '20260805_160441_curious_ladoo_services',
  },
  {
    up: migration_20260806_051406_curious_ladoo_brands.up,
    down: migration_20260806_051406_curious_ladoo_brands.down,
    name: '20260806_051406_curious_ladoo_brands',
  },
  {
    up: migration_20260806_060607_curious_ladoo_portfolio.up,
    down: migration_20260806_060607_curious_ladoo_portfolio.down,
    name: '20260806_060607_curious_ladoo_portfolio',
  },
  {
    up: migration_20260806_070027_curious_ladoo_how_we_work.up,
    down: migration_20260806_070027_curious_ladoo_how_we_work.down,
    name: '20260806_070027_curious_ladoo_how_we_work',
  },
  {
    up: migration_20260806_084335_curious_ladoo_testimonials.up,
    down: migration_20260806_084335_curious_ladoo_testimonials.down,
    name: '20260806_084335_curious_ladoo_testimonials',
  },
  {
    up: migration_20260806_094912_curious_ladoo_careers.up,
    down: migration_20260806_094912_curious_ladoo_careers.down,
    name: '20260806_094912_curious_ladoo_careers'
  },
];
