-- Comprehensive Cars Table Schema Update
-- This migration adds all the new columns from the Excel data structure
-- while maintaining backward compatibility with existing data

-- First, let's add the new columns to the existing cars table
ALTER TABLE cars 
ADD COLUMN IF NOT EXISTS version_id INTEGER,
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS body_style TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS onroad_price_delhi DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS key_price DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS key_mileage_arai TEXT,
ADD COLUMN IF NOT EXISTS key_engine TEXT,
ADD COLUMN IF NOT EXISTS key_transmission TEXT,
ADD COLUMN IF NOT EXISTS key_fuel_type TEXT,
ADD COLUMN IF NOT EXISTS key_seating_capacity TEXT,

-- Engine & Transmission
ADD COLUMN IF NOT EXISTS engine TEXT,
ADD COLUMN IF NOT EXISTS engine_type TEXT,
ADD COLUMN IF NOT EXISTS top_speed TEXT,
ADD COLUMN IF NOT EXISTS acceleration_0_100_kmph TEXT,
ADD COLUMN IF NOT EXISTS max_power_bhp INTEGER,
ADD COLUMN IF NOT EXISTS maxpower_rpm INTEGER,
ADD COLUMN IF NOT EXISTS max_torque_nm INTEGER,
ADD COLUMN IF NOT EXISTS maxtorque_rpm INTEGER,
ADD COLUMN IF NOT EXISTS performance_on_alternate_fuel TEXT,
ADD COLUMN IF NOT EXISTS max_engine_performance TEXT,
ADD COLUMN IF NOT EXISTS max_motor_performance TEXT,
ADD COLUMN IF NOT EXISTS powerconsumption_permileage TEXT,
ADD COLUMN IF NOT EXISTS driving_range TEXT,
ADD COLUMN IF NOT EXISTS drivetrain TEXT,
ADD COLUMN IF NOT EXISTS emission_standard TEXT,
ADD COLUMN IF NOT EXISTS turbocharger_supercharger TEXT,
ADD COLUMN IF NOT EXISTS battery TEXT,
ADD COLUMN IF NOT EXISTS battery_charging TEXT,
ADD COLUMN IF NOT EXISTS electric_motor TEXT,
ADD COLUMN IF NOT EXISTS others TEXT,
ADD COLUMN IF NOT EXISTS alternate_fuel TEXT,

-- Dimensions & Weight
ADD COLUMN IF NOT EXISTS length_mm INTEGER,
ADD COLUMN IF NOT EXISTS width_mm INTEGER,
ADD COLUMN IF NOT EXISTS height_mm INTEGER,
ADD COLUMN IF NOT EXISTS wheelbase_mm INTEGER,
ADD COLUMN IF NOT EXISTS ground_clearance_mm INTEGER,
ADD COLUMN IF NOT EXISTS kerb_weight_kg INTEGER,

-- Capacity
ADD COLUMN IF NOT EXISTS doors INTEGER,
ADD COLUMN IF NOT EXISTS no_of_seating_rows INTEGER,
ADD COLUMN IF NOT EXISTS bootspace_liters INTEGER,
ADD COLUMN IF NOT EXISTS fuel_tank_capacity_liters INTEGER,

-- Suspension, Brakes, Steering & Tyres
ADD COLUMN IF NOT EXISTS front_suspension TEXT,
ADD COLUMN IF NOT EXISTS rear_suspension TEXT,
ADD COLUMN IF NOT EXISTS front_brake_type TEXT,
ADD COLUMN IF NOT EXISTS rear_brake_type TEXT,
ADD COLUMN IF NOT EXISTS minimum_turning_radius_m TEXT,
ADD COLUMN IF NOT EXISTS steering_type TEXT,
ADD COLUMN IF NOT EXISTS wheels TEXT,
ADD COLUMN IF NOT EXISTS spare_wheel TEXT,
ADD COLUMN IF NOT EXISTS front_tyres TEXT,
ADD COLUMN IF NOT EXISTS rear_tyres TEXT,
ADD COLUMN IF NOT EXISTS four_wheel_steering BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS braking_performance TEXT,

-- Safety
ADD COLUMN IF NOT EXISTS overspeed_warning BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS lane_departure_warning BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS emergency_brake_light_flashing BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS forward_collision_warning_fcw BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS automatic_emergency_braking_aeb BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS high_beam_assist BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ncap_rating TEXT,
ADD COLUMN IF NOT EXISTS blind_spot_detection BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS lane_departure_prevention BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS puncture_repair_kit BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS rear_cross_traffic_assist BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS airbags INTEGER,
ADD COLUMN IF NOT EXISTS middle_rear_three_point_seatbelt BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS middle_rear_headrest BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tyre_pressure_monitoring_system_tpms BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS child_seat_anchor_points BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS seatbelt_warning BOOLEAN DEFAULT FALSE,

-- Braking & Traction
ADD COLUMN IF NOT EXISTS antilock_braking_system_abs BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS electronic_brakeforce_distribution_ebd BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS brake_assist_ba BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS electronic_stability_program BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS four_wheel_drive BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS hill_hold_control BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS traction_control_system_tc_tcs BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ride_height_adjustment BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS hill_descent_control BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS limited_slip_differential_lsd BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS differential_lock BOOLEAN DEFAULT FALSE,

-- Locks & Security
ADD COLUMN IF NOT EXISTS engine_immobilizer BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS central_locking BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS speed_sensing_doorlock BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS child_safety_lock BOOLEAN DEFAULT FALSE,

-- Comfort & Convenience
ADD COLUMN IF NOT EXISTS air_conditioner BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS front_ac BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS rear_ac BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS headlight_and_ignition_on_reminder BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS keyless_start_button_start BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS steering_adjustment TEXT,
ADD COLUMN IF NOT EXISTS v_power_outlets INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cruise_control BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS parking_sensors BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS parking_assist BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS antiglare_mirrors BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS vanity_mirrors_on_sunvisors BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS heater BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS cabin_bootaccess BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS third_row_ac BOOLEAN DEFAULT FALSE,

-- Telematics
ADD COLUMN IF NOT EXISTS remote_car_light_flashing_and_honking_via_app BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS geofence BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS remote_sunroof_open_close_via_app BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS over_the_air_updates_ota BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS check_vehicle_status_via_app BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS remote_car_lock_unlock_via_app BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS emergency_call BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS find_my_car BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS remote_ac_on_off_via_app BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS alexa_compatibility BOOLEAN DEFAULT FALSE,

-- Seats & Upholstery
ADD COLUMN IF NOT EXISTS driver_seat_adjustment TEXT,
ADD COLUMN IF NOT EXISTS front_passenger_seat_adjustment TEXT,
ADD COLUMN IF NOT EXISTS rear_row_seat_adjustment TEXT,
ADD COLUMN IF NOT EXISTS third_row_seat_adjustment TEXT,
ADD COLUMN IF NOT EXISTS seat_upholstery TEXT,
ADD COLUMN IF NOT EXISTS leather_wrapped_steering_wheel BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS leather_wrapped_gear_knob BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS driver_armrest BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS rear_passenger_seats_type TEXT,
ADD COLUMN IF NOT EXISTS third_row_seats_type TEXT,
ADD COLUMN IF NOT EXISTS ventilated_seats BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ventilated_seat_type TEXT,
ADD COLUMN IF NOT EXISTS interiors TEXT,
ADD COLUMN IF NOT EXISTS interior_colours TEXT,
ADD COLUMN IF NOT EXISTS rear_armrest BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS folding_rear_seat TEXT,
ADD COLUMN IF NOT EXISTS split_rear_seat TEXT,
ADD COLUMN IF NOT EXISTS split_third_row_seat TEXT,
ADD COLUMN IF NOT EXISTS front_seat_pockets BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS headrests TEXT,
ADD COLUMN IF NOT EXISTS fourth_row_seat_adjustment TEXT,

-- Storage
ADD COLUMN IF NOT EXISTS cup_holders BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS driver_armrest_storage BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS cooled_glove_box BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sunglass_holder BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS third_row_cup_holders BOOLEAN DEFAULT FALSE,

-- Doors, Windows, Mirrors & Wipers
ADD COLUMN IF NOT EXISTS one_touch_down BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS one_touch_up BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS power_windows BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS adjustable_orvm BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS turn_indicators_on_orvm BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS rear_defogger BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS rear_wiper BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS exterior_door_handles TEXT,
ADD COLUMN IF NOT EXISTS rain_sensing_wipers BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS interior_door_handles TEXT,
ADD COLUMN IF NOT EXISTS door_pockets BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS side_window_blinds BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS bootlid_opener BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS rear_windshield_blind BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS outside_rearview_mirrors_orvms TEXT,
ADD COLUMN IF NOT EXISTS scuff_plates BOOLEAN DEFAULT FALSE,

-- Exterior
ADD COLUMN IF NOT EXISTS sunroof_moonroof BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS roof_rails BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS roof_mounted_antenna BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS body_coloured_bumpers BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS chrome_finish_exhaust_pipe BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS body_kit BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS rub_strips BOOLEAN DEFAULT FALSE,

-- Lighting
ADD COLUMN IF NOT EXISTS fog_lights BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS daytime_running_lights BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS headlights TEXT,
ADD COLUMN IF NOT EXISTS automatic_head_lamps BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS followme_home_headlamps BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tail_lights TEXT,
ADD COLUMN IF NOT EXISTS cabin_lamps BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS headlight_height_adjuster BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS glove_box_lamp BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS lights_on_vanity_mirrors BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS rear_reading_lamp BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS cornering_headlights BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS puddle_lamps BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ambient_interior_lighting BOOLEAN DEFAULT FALSE,

-- Instrumentation
ADD COLUMN IF NOT EXISTS instrument_cluster TEXT,
ADD COLUMN IF NOT EXISTS trip_meter BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS average_fuel_consumption BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS average_speed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS distance_to_empty BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS clock BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS low_fuel_level_warning BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS door_ajar_warning BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS adjustable_cluster_brightness BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS gear_indicator BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS shift_indicator BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS headsup_display_hud BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tachometer BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS instantaneous_consumption BOOLEAN DEFAULT FALSE,

-- Entertainment, Information & Communication
ADD COLUMN IF NOT EXISTS smart_connectivity BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS integrated_indash_musicsystem BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS headunit_size TEXT,
ADD COLUMN IF NOT EXISTS display TEXT,
ADD COLUMN IF NOT EXISTS display_screen_for_rear_passengers BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS gps_navigation_system BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS speakers INTEGER,
ADD COLUMN IF NOT EXISTS usb_compatibility BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS aux_compatibility BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS bluetooth_compatibility BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS mp3_playback BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS cd_player BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS dvd_playback BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS am_fm_radio BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ipod_compatibility BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS internal_hard_drive BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS steering_mounted_controls BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS voice_command BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS wireless_charger BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS gesture_control BOOLEAN DEFAULT FALSE,

-- Manufacturer Warranty
ADD COLUMN IF NOT EXISTS warranty_years INTEGER,
ADD COLUMN IF NOT EXISTS warranty_kilometres INTEGER,
ADD COLUMN IF NOT EXISTS battery_warranty_years INTEGER,
ADD COLUMN IF NOT EXISTS battery_warranty_kilometres INTEGER,

-- Colors
ADD COLUMN IF NOT EXISTS color_name TEXT,
ADD COLUMN IF NOT EXISTS color_rgb TEXT,

-- Price breakdown
ADD COLUMN IF NOT EXISTS ex_showroom_price DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS rto DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS insurance DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS tax_collected_at_source_tcs DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS handling_logistic_charges DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS fast_tag DECIMAL(12,2),

-- On-road prices by city
ADD COLUMN IF NOT EXISTS onroad_price_mumbai DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS onroad_price_bangalore DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS onroad_price_delhi DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS onroad_price_pune DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS onroad_price_navi_mumbai DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS onroad_price_hyderabad DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS onroad_price_ahmedabad DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS onroad_price_chennai DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS onroad_price_kolkata DECIMAL(12,2),

-- Description
ADD COLUMN IF NOT EXISTS description TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cars_brand_model ON cars(brand, model);
CREATE INDEX IF NOT EXISTS idx_cars_fuel_type ON cars(fuel_type);
CREATE INDEX IF NOT EXISTS idx_cars_transmission ON cars(transmission);
CREATE INDEX IF NOT EXISTS idx_cars_body_style ON cars(body_style);
CREATE INDEX IF NOT EXISTS idx_cars_price_min ON cars(price_min);
CREATE INDEX IF NOT EXISTS idx_cars_price_max ON cars(price_max);
CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);

-- Add comments for documentation
COMMENT ON COLUMN cars.version_id IS 'Version ID from Excel data';
COMMENT ON COLUMN cars.source_url IS 'Source URL from Excel data';
COMMENT ON COLUMN cars.body_style IS 'Body style (Sedan, SUV, Hatchback, etc.)';
COMMENT ON COLUMN cars.onroad_price_delhi IS 'On-road price in Delhi';
COMMENT ON COLUMN cars.key_mileage_arai IS 'Key mileage (ARAI certified)';
COMMENT ON COLUMN cars.key_engine IS 'Key engine specification';
COMMENT ON COLUMN cars.key_transmission IS 'Key transmission type';
COMMENT ON COLUMN cars.key_fuel_type IS 'Key fuel type';
COMMENT ON COLUMN cars.key_seating_capacity IS 'Key seating capacity';

-- Engine & Transmission comments
COMMENT ON COLUMN cars.engine_type IS 'Engine type (e.g., B47 Turbocharged I4)';
COMMENT ON COLUMN cars.top_speed IS 'Top speed in km/h';
COMMENT ON COLUMN cars.acceleration_0_100_kmph IS '0-100 km/h acceleration time';
COMMENT ON COLUMN cars.max_power_bhp IS 'Maximum power in BHP';
COMMENT ON COLUMN cars.maxpower_rpm IS 'RPM at maximum power';
COMMENT ON COLUMN cars.max_torque_nm IS 'Maximum torque in NM';
COMMENT ON COLUMN cars.maxtorque_rpm IS 'RPM at maximum torque';
COMMENT ON COLUMN cars.drivetrain IS 'Drivetrain type (FWD, RWD, AWD)';
COMMENT ON COLUMN cars.emission_standard IS 'Emission standard (BS6, etc.)';

-- Dimensions comments
COMMENT ON COLUMN cars.length_mm IS 'Length in millimeters';
COMMENT ON COLUMN cars.width_mm IS 'Width in millimeters';
COMMENT ON COLUMN cars.height_mm IS 'Height in millimeters';
COMMENT ON COLUMN cars.wheelbase_mm IS 'Wheelbase in millimeters';
COMMENT ON COLUMN cars.ground_clearance_mm IS 'Ground clearance in millimeters';
COMMENT ON COLUMN cars.kerb_weight_kg IS 'Kerb weight in kilograms';

-- Capacity comments
COMMENT ON COLUMN cars.doors IS 'Number of doors';
COMMENT ON COLUMN cars.no_of_seating_rows IS 'Number of seating rows';
COMMENT ON COLUMN cars.bootspace_liters IS 'Boot space in liters';
COMMENT ON COLUMN cars.fuel_tank_capacity_liters IS 'Fuel tank capacity in liters';

-- Safety comments
COMMENT ON COLUMN cars.airbags IS 'Number of airbags';
COMMENT ON COLUMN cars.ncap_rating IS 'NCAP safety rating';

-- Price breakdown comments
COMMENT ON COLUMN cars.ex_showroom_price IS 'Ex-showroom price';
COMMENT ON COLUMN cars.rto IS 'RTO registration charges';
COMMENT ON COLUMN cars.insurance IS 'Insurance charges';
COMMENT ON COLUMN cars.tax_collected_at_source_tcs IS 'TCS (Tax Collected at Source)';
COMMENT ON COLUMN cars.handling_logistic_charges IS 'Handling and logistic charges';
COMMENT ON COLUMN cars.fast_tag IS 'Fast tag charges';

-- On-road prices by city comments
COMMENT ON COLUMN cars.onroad_price_mumbai IS 'On-road price in Mumbai';
COMMENT ON COLUMN cars.onroad_price_bangalore IS 'On-road price in Bangalore';
COMMENT ON COLUMN cars.onroad_price_delhi IS 'On-road price in Delhi';
COMMENT ON COLUMN cars.onroad_price_pune IS 'On-road price in Pune';
COMMENT ON COLUMN cars.onroad_price_navi_mumbai IS 'On-road price in Navi Mumbai';
COMMENT ON COLUMN cars.onroad_price_hyderabad IS 'On-road price in Hyderabad';
COMMENT ON COLUMN cars.onroad_price_ahmedabad IS 'On-road price in Ahmedabad';
COMMENT ON COLUMN cars.onroad_price_chennai IS 'On-road price in Chennai';
COMMENT ON COLUMN cars.onroad_price_kolkata IS 'On-road price in Kolkata';

-- Colors comments
COMMENT ON COLUMN cars.color_name IS 'Color name';
COMMENT ON COLUMN cars.color_rgb IS 'Color RGB value';

-- Warranty comments
COMMENT ON COLUMN cars.warranty_years IS 'Warranty period in years';
COMMENT ON COLUMN cars.warranty_kilometres IS 'Warranty distance in kilometres';
COMMENT ON COLUMN cars.battery_warranty_years IS 'Battery warranty period in years';
COMMENT ON COLUMN cars.battery_warranty_kilometres IS 'Battery warranty distance in kilometres';