package com.review.DTO;

import java.util.List;
import java.util.Map;

import com.review.Enum.SocialType;
import com.review.entity.userEntity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor   // ✅ 필드 순서대로 생성자 자동 생성
public class OAuth2Attributes {

    private final Map<String, Object> attributes;     // 원본 OAuth2 attributes
    private final String nameAttributeKey;            // 공급자별 PK (google: "sub", naver: "id"...)
    private final String name;
    private final String email;
    private final String birthdate;
    private final SocialType socialType;
    private final String picture;
    private final String nickname;

    // ⚠️ ⬇️ 이 생성자는 이제 필요 없으니까 "절대" 다시 만들지 마세요
    // public OAuth2Attributes(...) { ... }  ← 삭제!

    // ---------------------- provider 별 factory ----------------------
    public static OAuth2Attributes of(String registrationId, Map<String, Object> attributes) {
        if ("naver".equals(registrationId)) {
            return ofNaver(attributes);
        }
        if ("kakao".equals(registrationId)) {
            return ofKakao(attributes);
        }
        return ofGoogle(attributes);
    }

    // ---------------------- Google ----------------------
    @SuppressWarnings("unchecked")
    private static OAuth2Attributes ofGoogle(Map<String, Object> attributes) {
        String rawBirthdate = null;
        String picture = (String) attributes.get("picture");

        if (attributes.containsKey("birthdays")) {
            List<Map<String, Object>> birthdays =
                    (List<Map<String, Object>>) attributes.get("birthdays");
            if (!birthdays.isEmpty()) {
                Map<String, Object> dateMap =
                        (Map<String, Object>) birthdays.get(0).get("date");
                if (dateMap != null) {
                    String year = dateMap.get("year") != null ? dateMap.get("year").toString() : "1900";
                    String month = dateMap.get("month") != null ? dateMap.get("month").toString() : "01";
                    String day = dateMap.get("day") != null ? dateMap.get("day").toString() : "01";
                    rawBirthdate = String.format("%s-%s-%s", year, month, day);
                }
            }
        }

        return OAuth2Attributes.builder()
                .name((String) attributes.get("name"))
                .email((String) attributes.get("email"))
                .nameAttributeKey("sub")
                .attributes(attributes)
                .birthdate(rawBirthdate)
                .picture(picture)
                .socialType(SocialType.GOOGLE)
                .build();
    }

    // ---------------------- Naver ----------------------
    @SuppressWarnings("unchecked")
    private static OAuth2Attributes ofNaver(Map<String, Object> attributes) {
        Map<String, Object> response =
                (Map<String, Object>) attributes.get("response");

        String name = (String) response.get("name");
        String email = (String) response.get("email");
        String picture = (String) response.get("profile_image");

        String rawBirthdate = null;
        String birthyear = (String) response.get("birthyear");
        String birthday = (String) response.get("birthday"); // MM-DD

        if (birthyear != null && birthday != null) {
            rawBirthdate = String.format("%s-%s", birthyear, birthday);
        }

        return OAuth2Attributes.builder()
                .name(name)
                .email(email)
                .nameAttributeKey("id")
                .attributes(attributes)
                .birthdate(rawBirthdate)
                .picture(picture)
                .socialType(SocialType.NAVER)
                .build();
    }

    // ---------------------- Kakao ----------------------
    @SuppressWarnings("unchecked")
    private static OAuth2Attributes ofKakao(Map<String, Object> attributes) {

        Map<String, Object> kakaoAccount =
                (Map<String, Object>) attributes.get("kakao_account");
        Map<String, Object> profile =
                (Map<String, Object>) kakaoAccount.get("profile");

        String name = (String) kakaoAccount.get("name");
        String email = (String) kakaoAccount.get("email");
        String nickname = (String) profile.get("nickname");
        String picture = (String) profile.get("profile_image_url");

        String rawBirthdate = null;
        String birthyear = (String) kakaoAccount.get("birthyear");
        String birthday = (String) kakaoAccount.get("birthday"); // MMDD

        if (birthyear != null && birthday != null && birthday.length() == 4) {
            rawBirthdate = String.format(
                    "%s-%s-%s",
                    birthyear,
                    birthday.substring(0, 2),
                    birthday.substring(2)
            );
        }

        return OAuth2Attributes.builder()
                .name(name)
                .email(email)
                .nameAttributeKey("id")
                .attributes(attributes)
                .birthdate(rawBirthdate)
                .picture(picture)
                .nickname(nickname)
                .socialType(SocialType.KAKAO)
                .build();
    }

    // ---------------------- toEntity ----------------------
    public userEntity toEntity() {
        String finalBirthdate =
                (this.birthdate != null && !this.birthdate.isEmpty())
                        ? this.birthdate
                        : "1900-01-01";

        return userEntity.builder()
                .pname(name)
                .email(email)
                .nickname("reviewer_" + email.substring(0, email.indexOf('@')))
                .role("ROLE_USER")
                .birthdate(finalBirthdate)
                .password("oauth2_temp_password")
                .socialType(this.socialType)
                .isRequiredInfoMissing(true)
                .build();
    }
}
