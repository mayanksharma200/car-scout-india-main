-- Expand cars table to handle comprehensive car specifications from Excel data
-- This migration adds all the detailed columns needed for the extensive car database

-- Add comprehensive car specifications columns
ALTER TABLE public.cars
ADD COLUMN IF NOT EXISTS version_id INTEGER,
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS body_style TEXT,
ADD COLUMN IF NOT EXISTS status_notes TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS onroad_price_delhi INTEGER,
ADD COLUMN IF NOT EXISTS key_price INTEGER,
ADD COLUMN IF NOT EXISTS key_mileage_arai TEXT,
ADD COLUMN IF NOT EXISTS key_engine TEXT,
ADD COLUMN IF NOT EXISTS key_transmission TEXT,
ADD COLUMN IF NOT EXISTS key_fuel_type TEXT,
ADD COLUMN IF NOT EXISTS key_seating_capacity INTEGER,

-- Engine & Transmission details
ADD COLUMN IF NOT EXISTS engine TEXT,
ADD COLUMN IF NOT EXISTS engine_type TEXT,
ADD COLUMN IF NOT EXISTS top_speed INTEGER,
ADD COLUMN IF NOT EXISTS acceleration_0_100_kmph DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS max_power_bhp INTEGER,
ADD COLUMN IF NOT EXISTS max_power_rpm INTEGER,
ADD COLUMN IF NOT EXISTS max_torque_nm INTEGER,
ADD COLUMN IF NOT EXISTS max_torque_rpm INTEGER,
ADD COLUMN IF NOT EXISTS performance_on_alternate_fuel TEXT,
ADD COLUMN IF NOT EXISTS max_engine_performance JSONB,
ADD COLUMN IF NOT EXISTS max_motor_performance JSONB,
ADD COLUMN IF NOT EXISTS power_consumption_per_mileage TEXT,
ADD COLUMN IF NOT EXISTS driving_range INTEGER,
ADD COLUMN IF NOT EXISTS drivetrain TEXT,
ADD COLUMN IF NOT EXISTS emission_standard TEXT,
ADD COLUMN IF NOT EXISTS turbocharger_supercharger TEXT,
ADD COLUMN IF NOT EXISTS battery TEXT,
ADD COLUMN IF NOT EXISTS battery_charging TEXT,
ADD COLUMN IF NOT EXISTS electric_motor TEXT,
ADD COLUMN IF NOT EXISTS engine_others TEXT,
ADD COLUMN IF NOT EXISTS alternate_fuel TEXT,

-- Dimensions & Weight
ADD COLUMN IF NOT EXISTS length INTEGER,
ADD COLUMN IF NOT EXISTS width INTEGER,
ADD COLUMN IF NOT EXISTS height INTEGER,
ADD COLUMN IF NOT EXISTS wheelbase INTEGER,
ADD COLUMN IF NOT EXISTS ground_clearance INTEGER,
ADD COLUMN IF NOT EXISTS kerb_weight INTEGER,
ADD COLUMN IF NOT EXISTS doors INTEGER,
ADD COLUMN IF NOT EXISTS no_of_seating_rows INTEGER,
ADD COLUMN IF NOT EXISTS bootspace INTEGER,
ADD COLUMN IF NOT EXISTS fuel_tank_capacity INTEGER,

-- Suspension, Brakes, Steering & Tyres
ADD COLUMN IF NOT EXISTS front_suspension TEXT,
ADD COLUMN IF NOT EXISTS rear_suspension TEXT,
ADD COLUMN IF NOT EXISTS front_brake_type TEXT,
ADD COLUMN IF NOT EXISTS rear_brake_type TEXT,
ADD COLUMN IF NOT EXISTS minimum_turning_radius INTEGER,
ADD COLUMN IF NOT EXISTS steering_type TEXT,
ADD COLUMN IF NOT EXISTS wheels TEXT,
ADD COLUMN IF NOT EXISTS spare_wheels TEXT,
ADD COLUMN IF NOT EXISTS front_tyres TEXT,
ADD COLUMN IF NOT EXISTS rear_tyres TEXT,
ADD COLUMN IF NOT EXISTS four_wheel_steering BOOLEAN,
ADD COLUMN IF NOT EXISTS braking_performance TEXT,

-- Safety features
ADD COLUMN IF NOT EXISTS overspeed_warning BOOLEAN,
ADD COLUMN IF NOT EXISTS lane_departure_warning BOOLEAN,
ADD COLUMN IF NOT EXISTS emergency_brake_light_flashing BOOLEAN,
ADD COLUMN IF NOT EXISTS forward_collision_warning_fcw BOOLEAN,
ADD COLUMN IF NOT EXISTS automatic_emergency_braking_aeb BOOLEAN,
ADD COLUMN IF NOT EXISTS high_beam_assist BOOLEAN,
ADD COLUMN IF NOT EXISTS ncap_rating TEXT,
ADD COLUMN IF NOT EXISTS blind_spot_detection BOOLEAN,
ADD COLUMN IF NOT EXISTS lane_departure_prevention BOOLEAN,
ADD COLUMN IF NOT EXISTS puncture_repair_kit BOOLEAN,
ADD COLUMN IF NOT EXISTS rear_cross_traffic_assist BOOLEAN,
ADD COLUMN IF NOT EXISTS airbags INTEGER,
ADD COLUMN IF NOT EXISTS middle_rear_three_point_seatbelt BOOLEAN,
ADD COLUMN IF NOT EXISTS middle_rear_headrest BOOLEAN,
ADD COLUMN IF NOT EXISTS tyre_pressure_monitoring_system_tpms BOOLEAN,
ADD COLUMN IF NOT EXISTS child_seat_anchor_points BOOLEAN,
ADD COLUMN IF NOT EXISTS seatbelt_warning BOOLEAN,

-- Braking & Traction
ADD COLUMN IF NOT EXISTS antilock_braking_system_abs BOOLEAN,
ADD COLUMN IF NOT EXISTS electronic_brakeforce_distribution_ebd BOOLEAN,
ADD COLUMN IF NOT EXISTS brake_assist_ba BOOLEAN,
ADD COLUMN IF NOT EXISTS electronic_stability_program BOOLEAN,
ADD COLUMN IF NOT EXISTS four_wheel_drive BOOLEAN,
ADD COLUMN IF NOT EXISTS hill_hold_control BOOLEAN,
ADD COLUMN IF NOT EXISTS traction_control_system_tc_tcs BOOLEAN,
ADD COLUMN IF NOT EXISTS ride_height_adjustment BOOLEAN,
ADD COLUMN IF NOT EXISTS hill_descent_control BOOLEAN,
ADD COLUMN IF NOT EXISTS limited_slip_differential_lsd BOOLEAN,
ADD COLUMN IF NOT EXISTS differential_lock BOOLEAN,

-- Locks & Security
ADD COLUMN IF NOT EXISTS engine_immobilizer BOOLEAN,
ADD COLUMN IF NOT EXISTS central_locking BOOLEAN,
ADD COLUMN IF NOT EXISTS speed_sensing_door_lock BOOLEAN,
ADD COLUMN IF NOT EXISTS child_safety_lock BOOLEAN,

-- Comfort & Convenience
ADD COLUMN IF NOT EXISTS air_conditioner BOOLEAN,
ADD COLUMN IF NOT EXISTS front_ac BOOLEAN,
ADD COLUMN IF NOT EXISTS rear_ac BOOLEAN,
ADD COLUMN IF NOT EXISTS headlight_and_ignition_on_reminder BOOLEAN,
ADD COLUMN IF NOT EXISTS keyless_start_button_start BOOLEAN,
ADD COLUMN IF NOT EXISTS steering_adjustment TEXT,
ADD COLUMN IF NOT EXISTS v_power_outlets INTEGER,
ADD COLUMN IF NOT EXISTS cruise_control BOOLEAN,
ADD COLUMN IF NOT EXISTS parking_sensors BOOLEAN,
ADD COLUMN IF NOT EXISTS parking_assist BOOLEAN,
ADD COLUMN IF NOT EXISTS antiglare_mirrors BOOLEAN,
ADD COLUMN IF NOT EXISTS vanity_mirrors_on_sunvisors BOOLEAN,
ADD COLUMN IF NOT EXISTS heater BOOLEAN,
ADD COLUMN IF NOT EXISTS cabin_boot_access BOOLEAN,
ADD COLUMN IF NOT EXISTS third_row_ac BOOLEAN,

-- Telematics
ADD COLUMN IF NOT EXISTS remote_car_light_flashing_and_honking_via_app BOOLEAN,
ADD COLUMN IF NOT EXISTS geofence BOOLEAN,
ADD COLUMN IF NOT EXISTS remote_sunroof_open_close_via_app BOOLEAN,
ADD COLUMN IF NOT EXISTS over_the_air_updates_ota BOOLEAN,
ADD COLUMN IF NOT EXISTS check_vehicle_status_via_app BOOLEAN,
ADD COLUMN IF NOT EXISTS remote_car_lock_unlock_via_app BOOLEAN,
ADD COLUMN IF NOT EXISTS emergency_call BOOLEAN,
ADD COLUMN IF NOT EXISTS find_my_car BOOLEAN,
ADD COLUMN IF NOT EXISTS remote_ac_on_off_via_app BOOLEAN,
ADD COLUMN IF NOT EXISTS alexa_compatibility BOOLEAN,

-- Seats & Upholstery
ADD COLUMN IF NOT EXISTS driver_seat_adjustment TEXT,
ADD COLUMN IF NOT EXISTS front_passenger_seat_adjustment TEXT,
ADD COLUMN IF NOT EXISTS rear_row_seat_adjustment TEXT,
ADD COLUMN IF NOT EXISTS third_row_seat_adjustment TEXT,
ADD COLUMN IF NOT EXISTS seat_upholstery TEXT,
ADD COLUMN IF NOT EXISTS leather_wrapped_steering_wheel BOOLEAN,
ADD COLUMN IF NOT EXISTS leather_wrapped_gear_knob BOOLEAN,
ADD COLUMN IF NOT EXISTS driver_armrest BOOLEAN,
ADD COLUMN IF NOT EXISTS rear_passenger_seats_type TEXT,
ADD COLUMN IF NOT EXISTS third_row_seats_type TEXT,
ADD COLUMN IF NOT EXISTS ventilated_seats BOOLEAN,
ADD COLUMN IF NOT EXISTS ventilated_seat_type TEXT,
ADD COLUMN IF NOT EXISTS interiors TEXT,
ADD COLUMN IF NOT EXISTS interior_colours TEXT,
ADD COLUMN IF NOT EXISTS rear_armrest BOOLEAN,
ADD COLUMN IF NOT EXISTS folding_rear_seat TEXT,
ADD COLUMN IF NOT EXISTS split_rear_seat TEXT,
ADD COLUMN IF NOT EXISTS split_third_row_seat TEXT,
ADD COLUMN IF NOT EXISTS front_seatback_pockets BOOLEAN,
ADD COLUMN IF NOT EXISTS headrests TEXT,
ADD COLUMN IF NOT EXISTS fourth_row_seat_adjustment TEXT,

-- Storage
ADD COLUMN IF NOT EXISTS cup_holders INTEGER,
ADD COLUMN IF NOT EXISTS driver_armrest_storage BOOLEAN,
ADD COLUMN IF NOT EXISTS cooled_glove_box BOOLEAN,
ADD COLUMN IF NOT EXISTS sunglass_holder BOOLEAN,
ADD COLUMN IF NOT EXISTS third_row_cup_holders INTEGER,

-- Doors, Windows, Mirrors & Wipers
ADD COLUMN IF NOT EXISTS one_touch_down BOOLEAN,
ADD COLUMN IF NOT EXISTS one_touch_up BOOLEAN,
ADD COLUMN IF NOT EXISTS power_windows BOOLEAN,
ADD COLUMN IF NOT EXISTS adjustable_orvm BOOLEAN,
ADD COLUMN IF NOT EXISTS turn_indicators_on_orvm BOOLEAN,
ADD COLUMN IF NOT EXISTS rear_defogger BOOLEAN,
ADD COLUMN IF NOT EXISTS rear_wiper BOOLEAN,
ADD COLUMN IF NOT EXISTS exterior_door_handles TEXT,
ADD COLUMN IF NOT EXISTS rain_sensing_wipers BOOLEAN,
ADD COLUMN IF NOT EXISTS interior_door_handles TEXT,
ADD COLUMN IF NOT EXISTS door_pockets BOOLEAN,
ADD COLUMN IF NOT EXISTS side_window_blinds BOOLEAN,
ADD COLUMN IF NOT EXISTS bootlid_opener BOOLEAN,
ADD COLUMN IF NOT EXISTS rear_windshield_blind BOOLEAN,
ADD COLUMN IF NOT EXISTS outside_rearview_mirrors_orvms TEXT,
ADD COLUMN IF NOT EXISTS scuff_plates BOOLEAN,

-- Exterior
ADD COLUMN IF NOT EXISTS sunroof_moonroof BOOLEAN,
ADD COLUMN IF NOT EXISTS roof_rails BOOLEAN,
ADD COLUMN IF NOT EXISTS roof_mounted_antenna BOOLEAN,
ADD COLUMN IF NOT EXISTS body_coloured_bumpers BOOLEAN,
ADD COLUMN IF NOT EXISTS chrome_finish_exhaust_pipe BOOLEAN,
ADD COLUMN IF NOT EXISTS body_kit BOOLEAN,
ADD COLUMN IF NOT EXISTS rub_strips BOOLEAN,

-- Lighting
ADD COLUMN IF NOT EXISTS fog_lights BOOLEAN,
ADD COLUMN IF NOT EXISTS daytime_running_lights BOOLEAN,
ADD COLUMN IF NOT EXISTS headlights TEXT,
ADD COLUMN IF NOT EXISTS automatic_head_lamps BOOLEAN,
ADD COLUMN IF NOT EXISTS followme_home_headlamps BOOLEAN,
ADD COLUMN IF NOT EXISTS tail_lights TEXT,
ADD COLUMN IF NOT EXISTS cabin_lamps BOOLEAN,
ADD COLUMN IF NOT EXISTS headlight_height_adjuster BOOLEAN,
ADD COLUMN IF NOT EXISTS glove_box_lamp BOOLEAN,
ADD COLUMN IF NOT EXISTS lights_on_vanity_mirrors BOOLEAN,
ADD COLUMN IF NOT EXISTS rear_reading_lamp BOOLEAN,
ADD COLUMN IF NOT EXISTS cornering_headlights BOOLEAN,
ADD COLUMN IF NOT EXISTS puddle_lamps BOOLEAN,
ADD COLUMN IF NOT EXISTS ambient_interior_lighting BOOLEAN,

-- Instrumentation
ADD COLUMN IF NOT EXISTS instrument_cluster TEXT,
ADD COLUMN IF NOT EXISTS trip_meter BOOLEAN,
ADD COLUMN IF NOT EXISTS average_fuel_consumption BOOLEAN,
ADD COLUMN IF NOT EXISTS average_speed BOOLEAN,
ADD COLUMN IF NOT EXISTS distance_to_empty BOOLEAN,
ADD COLUMN IF NOT EXISTS clock BOOLEAN,
ADD COLUMN IF NOT EXISTS low_fuel_level_warning BOOLEAN,
ADD COLUMN IF NOT EXISTS door_ajar_warning BOOLEAN,
ADD COLUMN IF NOT EXISTS adjustable_cluster_brightness BOOLEAN,
ADD COLUMN IF NOT EXISTS gear_indicator BOOLEAN,
ADD COLUMN IF NOT EXISTS shift_indicator BOOLEAN,
ADD COLUMN IF NOT EXISTS headsup_display_hud BOOLEAN,
ADD COLUMN IF NOT EXISTS tachometer BOOLEAN,
ADD COLUMN IF NOT EXISTS instantaneous_consumption BOOLEAN,

-- Entertainment, Information & Communication
ADD COLUMN IF NOT EXISTS smart_connectivity BOOLEAN,
ADD COLUMN IF NOT EXISTS integrated_indash_musicsystem BOOLEAN,
ADD COLUMN IF NOT EXISTS headunit_size TEXT,
ADD COLUMN IF NOT EXISTS display TEXT,
ADD COLUMN IF NOT EXISTS display_screen_for_rear_passengers BOOLEAN,
ADD COLUMN IF NOT EXISTS gps_navigation_system BOOLEAN,
ADD COLUMN IF NOT EXISTS speakers INTEGER,
ADD COLUMN IF NOT EXISTS usb_compatibility BOOLEAN,
ADD COLUMN IF NOT EXISTS aux_compatibility BOOLEAN,
ADD COLUMN IF NOT EXISTS bluetooth_compatibility BOOLEAN,
ADD COLUMN IF NOT EXISTS mp3_playback BOOLEAN,
ADD COLUMN IF NOT EXISTS cd_player BOOLEAN,
ADD COLUMN IF NOT EXISTS dvd_playback BOOLEAN,
ADD COLUMN IF NOT EXISTS am_fm_radio BOOLEAN,
ADD COLUMN IF NOT EXISTS ipod_compatibility BOOLEAN,
ADD COLUMN IF NOT EXISTS internal_hard_drive BOOLEAN,
ADD COLUMN IF NOT EXISTS steering_mounted_controls BOOLEAN,
ADD COLUMN IF NOT EXISTS voice_command BOOLEAN,
ADD COLUMN IF NOT EXISTS wireless_charger BOOLEAN,
ADD COLUMN IF NOT EXISTS gesture_control BOOLEAN,

-- Manufacturer Warranty
ADD COLUMN IF NOT EXISTS warranty_in_years INTEGER,
ADD COLUMN IF NOT EXISTS warranty_in_kms INTEGER,
ADD COLUMN IF NOT EXISTS battery_warranty_in_years INTEGER,
ADD COLUMN IF NOT EXISTS battery_warranty_in_kms INTEGER,

-- Colors
ADD COLUMN IF NOT EXISTS color_name TEXT,
ADD COLUMN IF NOT EXISTS color_rgb TEXT,

-- Price breakdown
ADD COLUMN IF NOT EXISTS ex_showroom_price INTEGER,
ADD COLUMN IF NOT EXISTS rto INTEGER,
ADD COLUMN IF NOT EXISTS insurance INTEGER,
ADD COLUMN IF NOT EXISTS tax_collected_at_source_tcs INTEGER,
ADD COLUMN IF NOT EXISTS handling_logistic_charges INTEGER,
ADD COLUMN IF NOT EXISTS fast_tag INTEGER,

-- On-road prices by city
ADD COLUMN IF NOT EXISTS onroad_price_mumbai INTEGER,
ADD COLUMN IF NOT EXISTS onroad_price_bangalore INTEGER,
ADD COLUMN IF NOT EXISTS onroad_price_pune INTEGER,
ADD COLUMN IF NOT EXISTS onroad_price_navi_mumbai INTEGER,
ADD COLUMN IF NOT EXISTS onroad_price_hyderabad INTEGER,
ADD COLUMN IF NOT EXISTS onroad_price_ahmedabad INTEGER,
ADD COLUMN IF NOT EXISTS onroad_price_chennai INTEGER,
ADD COLUMN IF NOT EXISTS onroad_price_kolkata INTEGER,

-- Description
ADD COLUMN IF NOT EXISTS description TEXT;

-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_cars_version_id ON public.cars(version_id);
CREATE INDEX IF NOT EXISTS idx_cars_body_style ON public.cars(body_style);
CREATE INDEX IF NOT EXISTS idx_cars_fuel_type ON public.cars(fuel_type);
CREATE INDEX IF NOT EXISTS idx_cars_transmission ON public.cars(transmission);
CREATE INDEX IF NOT EXISTS idx_cars_drivetrain ON public.cars(drivetrain);
CREATE INDEX IF NOT EXISTS idx_cars_body_type ON public.cars(body_type);
CREATE INDEX IF NOT EXISTS idx_cars_seating_capacity ON public.cars(seating_capacity);
CREATE INDEX IF NOT EXISTS idx_cars_price_min ON public.cars(price_min);
CREATE INDEX IF NOT EXISTS idx_cars_price_max ON public.cars(price_max);
CREATE INDEX IF NOT EXISTS idx_cars_brand_model ON public.cars(brand, model);

-- Create a composite index for complex searches
CREATE INDEX IF NOT EXISTS idx_cars_search_composite ON public.cars(brand, model, body_style, fuel_type, transmission, price_min, status);

-- Add comments for documentation
COMMENT ON TABLE public.cars IS 'Comprehensive car database with detailed specifications from Excel data';
COMMENT ON COLUMN public.cars.version_id IS 'Unique version identifier from Excel data';
COMMENT ON COLUMN public.cars.source_url IS 'Original source URL for the car data';
COMMENT ON COLUMN public.cars.key_price IS 'Key price field from Excel (may contain formatted price string)';
COMMENT ON COLUMN public.cars.specifications IS 'JSON field for additional technical specifications';
COMMENT ON COLUMN public.cars.features IS 'JSON field for additional features list';