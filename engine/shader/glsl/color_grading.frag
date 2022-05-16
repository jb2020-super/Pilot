#version 310 es

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;

layout(set = 0, binding = 1) uniform sampler2D color_grading_lut_texture_sampler;

layout(location = 0) out highp vec4 out_color;

void main()
{
    highp ivec2 lut_tex_size = textureSize(color_grading_lut_texture_sampler, 0);
    highp float _COLORS      = float(lut_tex_size.y);
    highp float _COLORSX = float(lut_tex_size.x);

    highp float step = 1.0f / _COLORS;

    highp vec4 color       = subpassLoad(in_color).rgba;    
    
    highp float r_idx = clamp(color.r / _COLORS, 0.5f / _COLORSX, (_COLORS - 0.5f) / _COLORSX);

    highp float b_idx = clamp(color.b * _COLORS, 0.5f, _COLORS - 0.0f);

    highp float b_idx_1 = floor(b_idx);

    highp float rate = abs(b_idx_1 + 0.5 - b_idx);

    highp float b_idx_2;    
    if (b_idx < b_idx_1 + 0.5f ){
        b_idx_2 = b_idx_1 - 1.0f < 0.0f ? (b_idx_1 + 1.0f) : (b_idx_1 - 1.0f);
    }else{
        b_idx_2 = b_idx_1 + 1.0f > (_COLORS - 0.5f) ? (b_idx_1 - 1.0f) : (b_idx_1 + 1.0f);
    }
    highp vec2 uv;
    uv.y = color.g;
    uv.x = b_idx_1 * step + r_idx;
    highp vec4 color_sampled_1 = texture(color_grading_lut_texture_sampler, uv);

    uv.x = b_idx_2 * step + r_idx;
    highp vec4 color_sampled_2 = texture(color_grading_lut_texture_sampler, uv);

    out_color = color_sampled_1 * (1.0f - rate) + color_sampled_2 * rate;
}

